import { WebSocketServer, WebSocket } from "ws"
import type { Server } from "http"

interface RealtimeMessage {
  type: "subscribe" | "unsubscribe" | "broadcast" | "auth" | "ping"
  channel?: string
  data?: any
  token?: string
}

interface AuthenticatedWebSocket extends WebSocket {
  isAlive?: boolean
  userId?: string
  isAdmin?: boolean
  channels?: Set<string>
}

class RealtimeServer {
  private wss: WebSocketServer
  private subscriptions: Map<string, Set<AuthenticatedWebSocket>> = new Map()
  private clients: Map<string, AuthenticatedWebSocket> = new Map()
  private heartbeatInterval: NodeJS.Timeout | null = null

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server })

    this.wss.on("connection", (ws: AuthenticatedWebSocket) => {
      ws.isAlive = true
      ws.channels = new Set()

      console.log("[v0] WebSocket client connected")

      ws.on("message", (message: string) => {
        try {
          const msg: RealtimeMessage = JSON.parse(message)
          this.handleMessage(ws, msg)
        } catch (error) {
          console.error("[v0] WebSocket message error:", error)
          ws.send(JSON.stringify({ type: "error", error: "Invalid message format" }))
        }
      })

      ws.on("pong", () => {
        ws.isAlive = true
      })

      ws.on("close", () => {
        console.log("[v0] WebSocket client disconnected")
        this.removeClient(ws)
      })

      ws.on("error", (error) => {
        console.error("[v0] WebSocket error:", error)
      })
    })

    // Start heartbeat
    this.startHeartbeat()
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.wss.clients.forEach((ws: any) => {
        if (!ws.isAlive) {
          ws.terminate()
          return
        }
        ws.isAlive = false
        ws.ping()
      })
    }, 30000)
  }

  private handleMessage(ws: AuthenticatedWebSocket, message: RealtimeMessage) {
    switch (message.type) {
      case "auth":
        this.authenticateClient(ws, message.token || "")
        break
      case "subscribe":
        this.subscribe(ws, message.channel || "")
        break
      case "unsubscribe":
        this.unsubscribe(ws, message.channel || "")
        break
      case "broadcast":
        this.broadcastMessage(ws, message.channel || "", message.data)
        break
      case "ping":
        ws.send(JSON.stringify({ type: "pong" }))
        break
    }
  }

  private authenticateClient(ws: AuthenticatedWebSocket, token: string) {
    try {
      // Verify JWT token
      const payload = this.verifyToken(token)
      ws.userId = payload.userId
      ws.isAdmin = payload.role === "admin"
      const clientId = `${ws.userId}_${Date.now()}`
      this.clients.set(clientId, ws)

      ws.send(
        JSON.stringify({
          type: "auth-success",
          userId: ws.userId,
          isAdmin: ws.isAdmin,
          message: "Authenticated successfully",
        }),
      )

      console.log(`[v0] Client authenticated: ${ws.userId}`)
    } catch (error) {
      console.error("[v0] Authentication error:", error)
      ws.send(JSON.stringify({ type: "auth-error", error: "Authentication failed" }))
      ws.close()
    }
  }

  private subscribe(ws: AuthenticatedWebSocket, channel: string) {
    if (!ws.userId && !ws.isAdmin) {
      ws.send(JSON.stringify({ type: "error", error: "Not authenticated" }))
      return
    }

    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set())
    }

    this.subscriptions.get(channel)!.add(ws)
    ws.channels!.add(channel)

    ws.send(
      JSON.stringify({
        type: "subscribed",
        channel,
        message: `Subscribed to ${channel}`,
      }),
    )

    console.log(`[v0] Client ${ws.userId} subscribed to ${channel}`)
  }

  private unsubscribe(ws: AuthenticatedWebSocket, channel: string) {
    this.subscriptions.get(channel)?.delete(ws)
    ws.channels!.delete(channel)

    ws.send(
      JSON.stringify({
        type: "unsubscribed",
        channel,
        message: `Unsubscribed from ${channel}`,
      }),
    )
  }

  private broadcastMessage(ws: AuthenticatedWebSocket, channel: string, data: any) {
    if (!ws.isAdmin) {
      ws.send(JSON.stringify({ type: "error", error: "Unauthorized" }))
      return
    }

    const subscribers = this.subscriptions.get(channel)
    if (subscribers && subscribers.size > 0) {
      const message = JSON.stringify({
        type: "update",
        channel,
        data,
        timestamp: new Date().toISOString(),
        broadcastBy: ws.userId,
      })

      subscribers.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message)
        }
      })

      console.log(`[v0] Broadcast to ${subscribers.size} clients on ${channel}`)
    }
  }

  private removeClient(ws: AuthenticatedWebSocket) {
    for (const channel of ws.channels || []) {
      this.subscriptions.get(channel)?.delete(ws)
    }

    for (const [clientId, client] of this.clients.entries()) {
      if (client === ws) {
        this.clients.delete(clientId)
        break
      }
    }
  }

  private verifyToken(token: string): any {
    try {
      // In production, verify JWT properly
      const decoded = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString())
      return decoded
    } catch {
      throw new Error("Invalid token")
    }
  }

  public broadcast(channel: string, data: any) {
    const subscribers = this.subscriptions.get(channel)
    if (subscribers) {
      const message = JSON.stringify({
        type: "update",
        channel,
        data,
        timestamp: new Date().toISOString(),
      })

      subscribers.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message)
        }
      })
    }
  }

  public getStats() {
    return {
      connectedClients: this.clients.size,
      channels: Array.from(this.subscriptions.keys()),
      subscriberCounts: Object.fromEntries(
        Array.from(this.subscriptions.entries()).map(([channel, subs]) => [channel, subs.size]),
      ),
    }
  }

  public destroy() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }
    this.wss.close()
  }
}

export { RealtimeServer }

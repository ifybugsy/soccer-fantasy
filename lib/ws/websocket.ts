import { WebSocketServer, WebSocket } from "ws"
import type { Server } from "http"

interface WebSocketMessage {
  type: "subscribe" | "unsubscribe" | "update" | "broadcast"
  channel?: string
  data?: any
}

class WebSocketManager {
  private wss: WebSocketServer
  private subscriptions: Map<string, Set<WebSocket>> = new Map()

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server })

    this.wss.on("connection", (ws: WebSocket) => {
      console.log("[v0] WebSocket client connected")

      ws.on("message", (message: string) => {
        try {
          const msg: WebSocketMessage = JSON.parse(message)
          this.handleMessage(ws, msg)
        } catch (error) {
          console.error("[v0] WebSocket message error:", error)
        }
      })

      ws.on("close", () => {
        console.log("[v0] WebSocket client disconnected")
        this.removeSubscriptions(ws)
      })

      ws.on("error", (error) => {
        console.error("[v0] WebSocket error:", error)
      })
    })
  }

  private handleMessage(ws: WebSocket, message: WebSocketMessage) {
    switch (message.type) {
      case "subscribe":
        this.subscribe(ws, message.channel!)
        break
      case "unsubscribe":
        this.unsubscribe(ws, message.channel!)
        break
      case "broadcast":
        this.broadcast(message.channel!, message.data)
        break
    }
  }

  private subscribe(ws: WebSocket, channel: string) {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set())
    }
    this.subscriptions.get(channel)!.add(ws)
    console.log(`[v0] Client subscribed to ${channel}`)
  }

  private unsubscribe(ws: WebSocket, channel: string) {
    this.subscriptions.get(channel)?.delete(ws)
  }

  private removeSubscriptions(ws: WebSocket) {
    for (const subscribers of this.subscriptions.values()) {
      subscribers.delete(ws)
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

  public getSubscriberCount(channel: string): number {
    return this.subscriptions.get(channel)?.size ?? 0
  }
}

export { WebSocketManager }

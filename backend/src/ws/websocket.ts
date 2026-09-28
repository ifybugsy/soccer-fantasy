import WebSocket from "ws"
import { verifyToken } from "../config/jwt"
import { TransactionService } from "../services/transaction.service"
import { WalletService } from "../services/wallet.service"

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string
  isAlive?: boolean
}

export class WebSocketManager {
  private wss: WebSocket.Server
  private clients: Map<string, AuthenticatedWebSocket> = new Map()
  private transactionService: TransactionService
  private walletService: WalletService

  constructor(server: any) {
    this.wss = new WebSocket.Server({ server })
    this.transactionService = new TransactionService()
    this.walletService = new WalletService()

    this.initializeConnections()
    this.startHeartbeat()
  }

  private initializeConnections(): void {
    this.wss.on("connection", (ws: AuthenticatedWebSocket, req: any) => {
      console.log("[v0] WebSocket connection attempt")

      // Authenticate connection
      const token = this.extractToken(req.url)
      if (!token) {
        ws.close(4001, "Unauthorized")
        return
      }

      const payload = verifyToken(token)
      if (!payload) {
        ws.close(4001, "Invalid token")
        return
      }

      ws.userId = payload.userId
      ws.isAlive = true
      this.clients.set(payload.userId, ws)

      console.log("[v0] WebSocket connected:", payload.userId)

      // Handle messages
      ws.on("message", (message: string) => {
        this.handleMessage(ws, message)
      })

      // Handle disconnect
      ws.on("close", () => {
        console.log("[v0] WebSocket disconnected:", ws.userId)
        this.clients.delete(ws.userId!)
      })

      // Send connection success
      ws.send(
        JSON.stringify({
          type: "connection",
          status: "connected",
          userId: ws.userId,
          timestamp: new Date().toISOString(),
        }),
      )
    })
  }

  private handleMessage(ws: AuthenticatedWebSocket, message: string): void {
    try {
      const msg = JSON.parse(message)
      console.log("[v0] WebSocket message received:", msg.type)

      switch (msg.type) {
        case "subscribe":
          this.handleSubscribe(ws, msg)
          break
        case "ping":
          ws.send(JSON.stringify({ type: "pong", timestamp: new Date().toISOString() }))
          break
        default:
          ws.send(JSON.stringify({ error: "Unknown message type" }))
      }
    } catch (error) {
      console.error("[v0] WebSocket message error:", error)
    }
  }

  private handleSubscribe(ws: AuthenticatedWebSocket, msg: any): void {
    const { channel } = msg
    console.log("[v0] User subscribed to channel:", channel)

    ws.send(
      JSON.stringify({
        type: "subscription",
        channel,
        status: "subscribed",
        timestamp: new Date().toISOString(),
      }),
    )
  }

  private extractToken(url: string): string | null {
    const params = new URLSearchParams(url.split("?")[1])
    return params.get("token")
  }

  private startHeartbeat(): void {
    setInterval(() => {
      this.clients.forEach((ws, userId) => {
        if (!ws.isAlive) {
          console.log("[v0] Terminating inactive connection:", userId)
          ws.terminate()
          this.clients.delete(userId)
          return
        }

        ws.isAlive = false
        ws.ping()
      })
    }, 30000)
  }

  // Broadcast transaction update to user
  public broadcastTransactionUpdate(userId: string, transaction: any): void {
    const ws = this.clients.get(userId)
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "transaction",
          data: transaction,
          timestamp: new Date().toISOString(),
        }),
      )
    }
  }

  // Broadcast wallet update to user
  public broadcastWalletUpdate(userId: string, balance: number): void {
    const ws = this.clients.get(userId)
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "wallet_update",
          balance,
          timestamp: new Date().toISOString(),
        }),
      )
    }
  }

  // Broadcast to all connected users
  public broadcastToAll(message: any): void {
    this.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message))
      }
    })
  }

  public getConnectedUsersCount(): number {
    return this.clients.size
  }
}

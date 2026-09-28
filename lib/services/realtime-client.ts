interface RealtimeMessage {
  type: string
  channel?: string
  data?: any
  timestamp?: string
}

type RealtimeListener = (message: RealtimeMessage) => void

export class RealtimeClient {
  private ws: WebSocket | null = null
  private url: string
  private token: string | null = null
  private listeners: Map<string, Set<RealtimeListener>> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10
  private reconnectDelay = 3000
  private heartbeatInterval: NodeJS.Timeout | null = null
  private isConnecting = false

  constructor(url?: string) {
    this.url = url || `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/api/ws`
  }

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting) {
        resolve()
        return
      }

      this.isConnecting = true
      this.token = token

      try {
        this.ws = new WebSocket(this.url)

        this.ws.onopen = () => {
          console.log("[v0] WebSocket connected")
          this.isConnecting = false
          this.reconnectAttempts = 0

          // Send authentication
          this.send({
            type: "auth",
            token,
          })

          // Start heartbeat
          this.startHeartbeat()
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message: RealtimeMessage = JSON.parse(event.data)
            console.log("[v0] Realtime message received:", message.type)

            // Emit to all listeners for this channel
            if (message.channel) {
              const channelListeners = this.listeners.get(message.channel)
              if (channelListeners) {
                channelListeners.forEach((listener) => listener(message))
              }
            }

            // Emit to generic listeners
            const genericListeners = this.listeners.get("*")
            if (genericListeners) {
              genericListeners.forEach((listener) => listener(message))
            }
          } catch (error) {
            console.error("[v0] Failed to parse WebSocket message:", error)
          }
        }

        this.ws.onerror = (error) => {
          console.error("[v0] WebSocket error:", error)
          this.isConnecting = false
          reject(error)
        }

        this.ws.onclose = () => {
          console.log("[v0] WebSocket disconnected")
          this.isConnecting = false
          this.stopHeartbeat()
          this.attemptReconnect()
        }
      } catch (error) {
        console.error("[v0] WebSocket connection error:", error)
        this.isConnecting = false
        reject(error)
      }
    })
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("[v0] Max reconnection attempts reached")
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

    console.log(`[v0] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)

    setTimeout(() => {
      if (this.token) {
        this.connect(this.token).catch((error) => {
          console.error("[v0] Reconnection failed:", error)
        })
      }
    }, delay)
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.send({ type: "ping" })
    }, 30000)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }
  }

  send(message: RealtimeMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn("[v0] WebSocket not connected, message queued:", message.type)
    }
  }

  subscribe(channel: string, listener: RealtimeListener): () => void {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set())
    }

    this.listeners.get(channel)!.add(listener)

    // Send subscription to server
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.send({ type: "subscribe", channel })
    }

    // Return unsubscribe function
    return () => {
      this.unsubscribe(channel, listener)
    }
  }

  unsubscribe(channel: string, listener: RealtimeListener): void {
    this.listeners.get(channel)?.delete(listener)

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.send({ type: "unsubscribe", channel })
    }
  }

  broadcast(channel: string, data: any): void {
    this.send({
      type: "broadcast",
      channel,
      data,
    })
  }

  disconnect(): void {
    this.stopHeartbeat()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

export const realtimeClient = new RealtimeClient()

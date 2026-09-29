 "use client"

import { useEffect, useState, useCallback, useRef } from "react"

interface SyncEvent {
  channel: string
  event: string
  data: any
  timestamp: number
}

export function useRealtimeSync(channel: string | null, onMessage?: (event: SyncEvent) => void) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const connect = useCallback(() => {
    if (!channel) return

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
      const wsUrl = `${protocol}//${window.location.host}/api/ws/realtime?channel=${encodeURIComponent(channel)}`

      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        console.log("[v0] WebSocket connected:", channel)
        setIsConnected(true)
      }

      ws.onmessage = (event) => {
        try {
          const syncEvent = JSON.parse(event.data)
          console.log("[v0] Received sync event:", syncEvent)
          setLastUpdate(new Date())

          if (onMessage) {
            onMessage(syncEvent)
          }
        } catch (error) {
          console.error("[v0] Failed to parse sync event:", error)
        }
      }

      ws.onerror = (error) => {
        console.error("[v0] WebSocket error:", error)
        setIsConnected(false)
      }

      ws.onclose = () => {
        console.log("[v0] WebSocket disconnected:", channel)
        setIsConnected(false)

        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(connect, 3000)
      }

      wsRef.current = ws
    } catch (error) {
      console.error("[v0] Failed to connect to WebSocket:", error)
      setIsConnected(false)
    }
  }, [channel, onMessage])

  useEffect(() => {
    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [connect])

  const send = useCallback((event: string, data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          event,
          data,
          timestamp: Date.now(),
        }),
      )
    }
  }, [])

  return {
    isConnected,
    lastUpdate,
    send,
  }
}

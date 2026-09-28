"use client"

import { useEffect, useRef, useCallback, useState } from "react"

interface UseRealtimeOptions {
  url?: string
  token?: string
  channels?: string[]
}

export function useRealtime(options: UseRealtimeOptions = {}) {
  const wsRef = useRef<WebSocket | null>(null)
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState<any[]>([])

  useEffect(() => {
    const wsUrl = options.url || `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}`

    wsRef.current = new WebSocket(wsUrl)

    wsRef.current.onopen = () => {
      console.log("[v0] WebSocket connected")
      setConnected(true)

      // Send authentication
      if (options.token) {
        wsRef.current?.send(JSON.stringify({ type: "auth", token: options.token }))
      }

      // Subscribe to channels
      options.channels?.forEach((channel) => {
        wsRef.current?.send(JSON.stringify({ type: "subscribe", channel }))
      })
    }

    wsRef.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        console.log("[v0] Realtime message:", message)
        setMessages((prev) => [...prev, message])
      } catch (error) {
        console.error("[v0] Failed to parse message:", error)
      }
    }

    wsRef.current.onclose = () => {
      console.log("[v0] WebSocket disconnected")
      setConnected(false)
    }

    wsRef.current.onerror = (error) => {
      console.error("[v0] WebSocket error:", error)
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [options.token, options.channels])

  const subscribe = useCallback((channel: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "subscribe", channel }))
    }
  }, [])

  const unsubscribe = useCallback((channel: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "unsubscribe", channel }))
    }
  }, [])

  const send = useCallback((channel: string, data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "broadcast", channel, data }))
    }
  }, [])

  return {
    connected,
    messages,
    subscribe,
    unsubscribe,
    send,
  }
}

"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff } from "lucide-react"

export function RealtimeStatusBadge() {
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    // Check WebSocket status periodically
    const checkConnection = () => {
      const ws = new WebSocket(`${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}`)
      ws.onopen = () => {
        setConnected(true)
        ws.close()
      }
      ws.onerror = () => {
        setConnected(false)
      }
    }

    checkConnection()
    const interval = setInterval(checkConnection, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-2">
      <Badge variant={connected ? "default" : "secondary"} className="gap-1">
        {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
        {connected ? "Connected" : "Offline"}
      </Badge>
    </div>
  )
}

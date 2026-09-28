"use client"

import { useRealtimeSync } from "@/lib/hooks/use-realtime-sync"
import { Badge } from "@/components/ui/badge"
import { Zap, WifiOff } from "lucide-react"

interface RealtimeSyncIndicatorProps {
  channel: string
  showLabel?: boolean
}

export function RealtimeSyncIndicator({ channel, showLabel = true }: RealtimeSyncIndicatorProps) {
  const { isConnected, lastUpdate } = useRealtimeSync(channel)

  const formatLastUpdate = (date: Date | null) => {
    if (!date) return "Never"
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (seconds < 60) return "now"
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    return `${Math.floor(seconds / 3600)}h ago`
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant={isConnected ? "default" : "secondary"} className="flex items-center gap-1">
        {isConnected ? (
          <>
            <Zap size={12} className="animate-pulse" />
            {showLabel && "Live"}
          </>
        ) : (
          <>
            <WifiOff size={12} />
            {showLabel && "Offline"}
          </>
        )}
      </Badge>
      {showLabel && <span className="text-xs text-muted-foreground">{formatLastUpdate(lastUpdate)}</span>}
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRealtimeSync } from "@/lib/hooks/use-realtime-sync"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, TrendingUp } from "lucide-react"

interface Standing {
  rank: number
  player: string
  points: number
  matches: number
  wins: number
}

interface LeagueLiveStandingsProps {
  leagueId: string
}

export function LeagueLiveStandings({ leagueId }: LeagueLiveStandingsProps) {
  const [standings, setStandings] = useState<Standing[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const { isConnected } = useRealtimeSync(`league:${leagueId}`, (event) => {
    if (event.event === "standings_updated") {
      console.log("[v0] Standings updated:", event.data)
      setLastUpdate(new Date())
    }
  })

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const response = await fetch(`/api/v1/leagues/${leagueId}/standings`)
        const data = await response.json()
        if (data.success) {
          setStandings(data.data)
          setLastUpdate(new Date())
        }
      } catch (error) {
        console.error("[v0] Failed to fetch standings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStandings()

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchStandings, 5000)
    return () => clearInterval(interval)
  }, [leagueId])

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading standings...</div>
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            League Standings (Real-time)
          </CardTitle>
          <Badge variant={isConnected ? "default" : "secondary"} className="flex items-center gap-1">
            {isConnected && <Zap size={12} />}
            {isConnected ? "Live" : "Cached"}
          </Badge>
        </div>
        {lastUpdate && <p className="text-xs text-muted-foreground mt-2">Updated {lastUpdate.toLocaleTimeString()}</p>}
      </CardHeader>
      <CardContent>
        <div className="space-y-1 overflow-x-auto">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 p-3 border-b border-border bg-muted rounded-t font-semibold text-xs sm:text-sm">
            <div className="col-span-1">Rank</div>
            <div className="col-span-4">Player</div>
            <div className="col-span-2">Points</div>
            <div className="col-span-2">Matches</div>
            <div className="col-span-3">Wins</div>
          </div>

          {/* Rows */}
          {standings.map((standing) => (
            <div
              key={standing.rank}
              className="grid grid-cols-12 gap-2 p-3 hover:bg-accent/5 rounded transition border-b border-border/50 text-xs sm:text-sm"
            >
              <div className="col-span-1 font-bold text-primary">
                {standing.rank === 1 ? "🥇" : standing.rank === 2 ? "🥈" : standing.rank === 3 ? "🥉" : standing.rank}
              </div>
              <div className="col-span-4 font-medium truncate">{standing.player}</div>
              <div className="col-span-2 font-bold">{standing.points}</div>
              <div className="col-span-2">{standing.matches}</div>
              <div className="col-span-3 text-accent font-semibold">{standing.wins}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

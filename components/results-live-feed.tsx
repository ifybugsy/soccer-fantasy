"use client"

import { useState, useEffect } from "react"
import { useRealtimeSync } from "@/lib/hooks/use-realtime-sync"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Trophy } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface LiveResult {
  _id: string
  username: string
  leagueType: string
  homeTeam: { name: string; score: number }
  awayTeam: { name: string; score: number }
  submittedAt: string
  syncedToLeagues: boolean
}

export function ResultsLiveFeed() {
  const [results, setResults] = useState<LiveResult[]>([])
  const [loading, setLoading] = useState(true)

  const { isConnected } = useRealtimeSync("results:all", (event) => {
    if (event.event === "result_submitted") {
      const newResult = event.data
      setResults((prev) => [newResult, ...prev].slice(0, 10))
    }
  })

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const response = await fetch("/api/v1/results/stream?limit=10")
        const data = await response.json()
        if (data.success) {
          setResults(data.data)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch initial results:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchInitial()
  }, [])

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Trophy className="w-10 h-10 text-muted-foreground mb-3 opacity-50" />
          <p className="text-muted-foreground text-sm">No results yet. Submit your first match!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {results.map((result) => (
        <Card key={result._id} className="hover:shadow-md transition overflow-hidden">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-primary">{result.username}</p>
                  <p className="text-xs text-muted-foreground">{result.leagueType}</p>
                </div>
                <Badge
                  variant={result.syncedToLeagues ? "default" : "secondary"}
                  className="flex items-center gap-1 text-xs"
                >
                  {result.syncedToLeagues ? (
                    <>
                      <Zap size={10} />
                      Live
                    </>
                  ) : (
                    "Pending"
                  )}
                </Badge>
              </div>

              <div className="flex items-center justify-between bg-muted/30 rounded p-2">
                <div className="text-center flex-1">
                  <p className="text-xs text-muted-foreground">{result.homeTeam.name}</p>
                  <p className="font-bold text-primary">{result.homeTeam.score}</p>
                </div>
                <p className="text-muted-foreground text-xs font-semibold px-2">vs</p>
                <div className="text-center flex-1">
                  <p className="text-xs text-muted-foreground">{result.awayTeam.name}</p>
                  <p className="font-bold text-accent">{result.awayTeam.score}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

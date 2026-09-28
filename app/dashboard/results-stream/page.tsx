"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Zap, Calendar, Users, Trophy } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface MatchResult {
  _id: string
  username: string
  leagueType: string
  homeTeam: { name: string; score: number }
  awayTeam: { name: string; score: number }
  winner: string
  goalScorers: Array<{ playerName: string; matchMinute: string }>
  submittedAt: string
  syncedToLeagues: boolean
}

export default function ResultsStreamPage() {
  const [results, setResults] = useState<MatchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "classic" | "h2h" | "cup" | "mini">("all")
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const query = filter !== "all" ? `?leagueType=${filter}` : "?limit=50"
        const response = await fetch(`/api/v1/results/stream${query}`)
        const data = await response.json()

        if (data.success) {
          setResults(data.data)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch results:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()

    // Poll for updates every 3 seconds
    const interval = setInterval(fetchResults, 3000)
    return () => clearInterval(interval)
  }, [filter])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const query = filter !== "all" ? `?leagueType=${filter}` : "?limit=50"
      const response = await fetch(`/api/v1/results/stream${query}`)
      const data = await response.json()

      if (data.success) {
        setResults(data.data)
      }
    } catch (error) {
      console.error("[v0] Failed to refresh:", error)
    } finally {
      setRefreshing(false)
    }
  }

  const getLeagueLabel = (type: string) => {
    const labels: Record<string, string> = {
      classic: "Classic",
      h2h: "Head-to-Head",
      cup: "Cup Tournament",
      mini: "Mini Cup",
    }
    return labels[type] || type
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Live Results</h1>
            <p className="text-muted-foreground">Real-time match results from all your leagues</p>
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing} className="bg-transparent">
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {(["all", "classic", "h2h", "cup", "mini"] as const).map((type) => (
            <Button
              key={type}
              variant={filter === type ? "default" : "outline"}
              onClick={() => setFilter(type)}
              className="whitespace-nowrap"
            >
              {type === "all" ? "All Leagues" : getLeagueLabel(type)}
            </Button>
          ))}
        </div>

        {/* Results List */}
        <div className="space-y-4">
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : results.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No results submitted yet</p>
              </CardContent>
            </Card>
          ) : (
            results.map((result) => (
              <Card key={result._id} className="hover:shadow-lg transition">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Header Row */}
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-semibold text-primary flex items-center gap-2">
                          <Users size={14} />
                          {result.username}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          <Calendar size={12} className="inline mr-1" />
                          {formatTime(result.submittedAt)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={result.syncedToLeagues ? "default" : "secondary"}>
                          {result.syncedToLeagues ? (
                            <>
                              <Zap size={12} className="mr-1" />
                              Live
                            </>
                          ) : (
                            "Pending"
                          )}
                        </Badge>
                        <Badge variant="outline">{getLeagueLabel(result.leagueType)}</Badge>
                      </div>
                    </div>

                    {/* Match Score */}
                    <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-around">
                      <div className="text-center">
                        <p className="text-sm font-semibold">{result.homeTeam.name}</p>
                        <p className="text-2xl font-bold text-primary">{result.homeTeam.score}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground font-semibold">FINAL</p>
                        <p className="text-lg text-muted-foreground">—</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold">{result.awayTeam.name}</p>
                        <p className="text-2xl font-bold text-accent">{result.awayTeam.score}</p>
                      </div>
                    </div>

                    {/* Goal Scorers */}
                    {result.goalScorers.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2">GOAL SCORERS</p>
                        <div className="flex flex-wrap gap-2">
                          {result.goalScorers.map((scorer, idx) => (
                            <Badge key={idx} variant="outline">
                              {scorer.playerName} ({scorer.matchMinute}')
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

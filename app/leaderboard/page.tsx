"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, TrendingUp, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import { apiClient } from "@/lib/services/api-client"

interface LeaderboardEntry {
  id?: string
  rank: number
  username: string
  points: number
  level?: string
  gamesPlayed: number
  winRate: number
  country?: string
}

export default function LeaderboardPage() {
  const [globalData, setGlobalData] = useState<LeaderboardEntry[]>([])
  const [countryData, setCountryData] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<"global" | "country">("global")
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "error">("synced")

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true)
      setSyncStatus("syncing")
      try {
        const response = await apiClient.get("/leaderboard")
        if (response.success && Array.isArray(response.data)) {
          const players = response.data as any[]

          // Process global leaderboard
          const global = players
            .sort((a, b) => (b.points || 0) - (a.points || 0))
            .slice(0, 10)
            .map((p, idx) => ({
              id: `global-${idx}-${p._id || p.id}`,
              rank: idx + 1,
              username: p.name || "Unknown",
              points: p.points || 0,
              level: p.level || "Silver",
              gamesPlayed: p.matches || 0,
              winRate: p.winRate || 0,
            }))

          // Process country leaderboard
          const byCountry: Record<string, any[]> = {}
          players.forEach((p) => {
            const country = p.country || "Unknown"
            if (!byCountry[country]) byCountry[country] = []
            byCountry[country].push(p)
          })

          const country = Object.entries(byCountry).flatMap(([c, players], countryIdx) =>
            players
              .sort((a, b) => (b.points || 0) - (a.points || 0))
              .slice(0, 5)
              .map((p, idx) => ({
                id: `country-${countryIdx}-${idx}-${p._id || p.id}`,
                rank: idx + 1,
                username: p.name || "Unknown",
                points: p.points || 0,
                gamesPlayed: p.matches || 0,
                winRate: p.winRate || 0,
                country: c,
              })),
          )

          setGlobalData(global)
          setCountryData(country)
          setSyncStatus("synced")
        }
      } catch (error) {
        console.error("[v0] Failed to fetch leaderboard:", error)
        setSyncStatus("error")
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
    const syncInterval = setInterval(fetchLeaderboard, 5000)
    return () => clearInterval(syncInterval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-muted-foreground">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Back Navigation */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2 bg-transparent hover:bg-primary/10">
                <ArrowLeft size={16} /> Back to Home
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-8 h-8 text-accent" />
                <h1 className="text-3xl font-bold">Global Leaderboard</h1>
              </div>
              <p className="text-muted-foreground">Compete globally and climb the rankings</p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <div
              className={`w-2 h-2 rounded-full ${
                syncStatus === "synced" ? "bg-green-500" : syncStatus === "syncing" ? "bg-yellow-500" : "bg-red-500"
              }`}
            />
            {syncStatus === "synced" ? "Live Updates" : syncStatus === "syncing" ? "Syncing..." : "Error"}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={(val) => setSelectedTab(val as "global" | "country")}>
          <TabsList className="grid w-full md:w-auto grid-cols-2">
            <TabsTrigger value="global">Global Rankings</TabsTrigger>
            <TabsTrigger value="country">Country Rankings</TabsTrigger>
          </TabsList>

          {/* Global Rankings Tab */}
          <TabsContent value="global" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Top 10 Players Worldwide</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {/* Header Row */}
                  <div className="grid grid-cols-12 gap-3 p-3 border-b border-border font-semibold text-sm">
                    <div className="col-span-1">Rank</div>
                    <div className="col-span-3">Player</div>
                    <div className="col-span-2">Points</div>
                    <div className="col-span-2">Level</div>
                    <div className="col-span-2">Games</div>
                    <div className="col-span-2">Win %</div>
                  </div>

                  {globalData.map((entry) => (
                    <div key={entry.id} className="grid grid-cols-12 gap-3 p-3 hover:bg-accent/5 rounded transition">
                      <div className="col-span-1 font-bold text-primary">
                        {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : entry.rank}
                      </div>
                      <div className="col-span-3">
                        <p className="font-semibold truncate">{entry.username}</p>
                      </div>
                      <div className="col-span-2 font-bold text-accent">{entry.points.toLocaleString()}</div>
                      <div className="col-span-2">
                        <Badge
                          variant={
                            entry.level === "Legendary" ? "default" : entry.level === "Elite" ? "secondary" : "outline"
                          }
                        >
                          {entry.level}
                        </Badge>
                      </div>
                      <div className="col-span-2">{entry.gamesPlayed}</div>
                      <div className="col-span-2 text-green-600 font-semibold">{entry.winRate}%</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Country Rankings Tab */}
          <TabsContent value="country" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Players by Country</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {/* Header Row */}
                  <div className="grid grid-cols-12 gap-3 p-3 border-b border-border font-semibold text-sm">
                    <div className="col-span-1">Rank</div>
                    <div className="col-span-3">Player</div>
                    <div className="col-span-3">Country</div>
                    <div className="col-span-2">Points</div>
                    <div className="col-span-3">Games</div>
                  </div>

                  {countryData.map((entry) => (
                    <div key={entry.id} className="grid grid-cols-12 gap-3 p-3 hover:bg-accent/5 rounded transition">
                      <div className="col-span-1 font-bold text-primary">
                        {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : entry.rank}
                      </div>
                      <div className="col-span-3">
                        <p className="font-semibold truncate">{entry.username}</p>
                      </div>
                      <div className="col-span-3">
                        <Badge variant="outline">{entry.country}</Badge>
                      </div>
                      <div className="col-span-2 font-bold text-accent">{entry.points.toLocaleString()}</div>
                      <div className="col-span-3">{entry.gamesPlayed}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Featured Card */}
        <Card className="mt-8 bg-gradient-to-br from-primary/20 to-accent/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-2">Top Ranked Player</p>
                <p className="text-2xl font-bold">{globalData[0]?.username || "N/A"}</p>
                <p className="text-accent">
                  {globalData[0]?.points.toLocaleString() || 0} Points • {globalData[0]?.level || "N/A"}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-accent opacity-30" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

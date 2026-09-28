"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw } from "lucide-react"

export default function SyncCenterPage() {
  const [syncData, setSyncData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    fetchSyncData()
    // Auto-sync every 5 seconds
    const interval = setInterval(fetchSyncData, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchSyncData = async () => {
    try {
      const response = await fetch("/api/admin/sync-data")
      const data = await response.json()
      setSyncData(data)
      setLastSync(data.timestamp)
    } catch (error) {
      console.error("[v0] Failed to fetch sync data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleManualSync = async (action: string) => {
    setIsSyncing(true)
    try {
      const response = await fetch("/api/admin/sync-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        await fetchSyncData()
      }
    } catch (error) {
      console.error("[v0] Sync failed:", error)
    } finally {
      setIsSyncing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading sync data...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Real-Time Sync Center</h1>
            <p className="text-muted-foreground">Monitor and manage data synchronization across platforms</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Last Sync:</p>
            <p className="text-sm font-semibold">{lastSync ? new Date(lastSync).toLocaleTimeString() : "Never"}</p>
          </div>
        </div>

        {/* Platform Metrics */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{syncData?.platformMetrics?.activeUsers || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Real-time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{syncData?.platformMetrics?.activeMatches || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">In progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Live Leagues</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{syncData?.platformMetrics?.liveLeagues || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Active now</p>
            </CardContent>
          </Card>
        </div>

        {/* Sync Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Sync Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => handleManualSync("update-standings")}
              disabled={isSyncing}
              className="w-full flex gap-2"
            >
              <RefreshCw size={18} /> Sync League Standings
            </Button>
            <Button onClick={() => handleManualSync("sync-scorers")} disabled={isSyncing} className="w-full flex gap-2">
              <RefreshCw size={18} /> Sync Goal Scorers
            </Button>
            <Button
              onClick={() => handleManualSync("refresh-transactions")}
              disabled={isSyncing}
              className="w-full flex gap-2"
            >
              <RefreshCw size={18} /> Refresh Transactions
            </Button>
          </CardContent>
        </Card>

        {/* Goal Scorers */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Top Goal Scorers
              <Badge>Synced</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {syncData?.goalScorers?.map((scorer: any) => (
                <div key={scorer.id} className="flex justify-between items-center p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-semibold">{scorer.playerName}</p>
                    <p className="text-xs text-muted-foreground">{scorer.assists} assists</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{scorer.goals} Goals</p>
                    <p className="text-xs text-muted-foreground">{scorer.efficiency}% efficiency</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* League Standings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              League Standings
              <Badge>Synced</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr className="text-muted-foreground">
                    <th className="text-left py-3 px-4 font-medium">Position</th>
                    <th className="text-left py-3 px-4 font-medium">Player</th>
                    <th className="text-left py-3 px-4 font-medium">Points</th>
                    <th className="text-left py-3 px-4 font-medium">Matches</th>
                    <th className="text-left py-3 px-4 font-medium">Wins</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {syncData?.leagueStandings?.map((standing: any) => (
                    <tr key={standing.position} className="hover:bg-accent/5">
                      <td className="py-3 px-4 font-bold">{standing.position}</td>
                      <td className="py-3 px-4">{standing.playerName}</td>
                      <td className="py-3 px-4 font-semibold text-primary">{standing.points}</td>
                      <td className="py-3 px-4">{standing.matches}</td>
                      <td className="py-3 px-4">{standing.wins}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

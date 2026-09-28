"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Zap, Activity, AlertCircle, CheckCircle2 } from "lucide-react"
import { RealtimeSyncIndicator } from "@/components/realtime-sync-indicator"

interface SyncMetrics {
  totalResults: number
  resultsSynced: number
  resultsApproved: number
  resultsPending: number
  leaguesUpdated: number
  playersAffected: number
  lastSyncTime: string
  syncStatus: "synced" | "syncing" | "error"
}

export default function SyncMonitorPage() {
  const [metrics, setMetrics] = useState<SyncMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchMetrics = async () => {
    try {
      const response = await fetch("/api/admin/sync-data")
      const data = await response.json()

      setMetrics({
        totalResults: data.totalResults || 0,
        resultsSynced: data.resultsSynced || 0,
        resultsApproved: data.resultsApproved || 0,
        resultsPending: data.resultsPending || 0,
        leaguesUpdated: data.leaguesUpdated || 0,
        playersAffected: data.playersAffected || 0,
        lastSyncTime: new Date().toLocaleTimeString(),
        syncStatus: "synced",
      })
    } catch (error) {
      console.error("[v0] Failed to fetch metrics:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()

    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchMetrics, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const response = await fetch("/api/admin/sync-data", { method: "POST" })
      if (response.ok) {
        await fetchMetrics()
      }
    } catch (error) {
      console.error("[v0] Refresh failed:", error)
    } finally {
      setRefreshing(false)
    }
  }

  const syncPercentage = metrics ? (metrics.resultsSynced / metrics.totalResults) * 100 : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading sync metrics...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Sync Monitor</h1>
            <p className="text-muted-foreground">Real-time data synchronization dashboard</p>
          </div>
          <div className="flex gap-3">
            <RealtimeSyncIndicator channel="sync:all" showLabel={true} />
            <Button onClick={handleRefresh} disabled={refreshing} variant="outline" className="bg-transparent">
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Results</CardTitle>
              <Activity className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.totalResults || 0}</div>
              <p className="text-xs text-muted-foreground">All submissions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Synced Results</CardTitle>
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.resultsSynced || 0}</div>
              <p className="text-xs text-muted-foreground">{Math.round(syncPercentage)}% synced</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <AlertCircle className="w-4 h-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.resultsPending || 0}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leagues Updated</CardTitle>
              <Zap className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.leaguesUpdated || 0}</div>
              <p className="text-xs text-muted-foreground">Active leagues</p>
            </CardContent>
          </Card>
        </div>

        {/* Sync Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-500" />
              Synchronization Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Results Synced to Leagues</span>
                <span className="text-sm font-semibold">{Math.round(syncPercentage)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                  style={{ width: `${syncPercentage}%` }}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm font-medium mb-2">Impact Metrics</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Players Affected</span>
                    <span className="font-semibold">{metrics?.playersAffected || 0}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Leagues Updated</span>
                    <span className="font-semibold">{metrics?.leaguesUpdated || 0}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Results Approved</span>
                    <span className="font-semibold">{metrics?.resultsApproved || 0}</span>
                  </li>
                </ul>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">System Status</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-muted-foreground">Sync Status</span>
                    <Badge className="ml-auto">Active</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-muted-foreground">Real-time Updates</span>
                    <Badge variant="secondary" className="ml-auto">
                      Connected
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Last Update</span>
                    <span className="ml-auto text-xs font-semibold">{metrics?.lastSyncTime}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sync Details */}
        <Card>
          <CardHeader>
            <CardTitle>Sync Queue Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-lg p-4 hover:bg-muted/50 transition">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-green-500" />
                      Completed Syncs
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {metrics?.resultsSynced || 0} results successfully synced to all affected leagues in real-time
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">{Math.round(syncPercentage)}%</Badge>
                </div>
              </div>

              <div className="border rounded-lg p-4 hover:bg-muted/50 transition">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold flex items-center gap-2">
                      <AlertCircle size={16} className="text-yellow-500" />
                      Pending Queue
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {metrics?.resultsPending || 0} results awaiting admin approval before sync
                    </p>
                  </div>
                  <Badge variant="secondary">{metrics?.resultsPending || 0}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

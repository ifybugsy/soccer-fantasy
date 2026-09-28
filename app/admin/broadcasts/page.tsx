"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Youtube, Facebook, Users, Clock } from "lucide-react"

interface Broadcast {
  id: string
  platform: "YouTube" | "Facebook"
  title: string
  streamer: string
  viewers: number
  status: "live" | "scheduled" | "ended"
  startedAt: string
  duration: string
}

export default function BroadcastsPage() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
  const [loading, setLoading] = useState(true)
  const [totalViewers, setTotalViewers] = useState(0)

  useEffect(() => {
    const fetchBroadcasts = async () => {
      try {
        const response = await fetch("/api/admin/broadcasts")
        const data = await response.json()
        setBroadcasts(data.broadcasts || [])
        setTotalViewers(data.totalViewers || 0)
      } catch (error) {
        console.error("[v0] Failed to fetch broadcasts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBroadcasts()

    // Real-time updates every 3 seconds
    const interval = setInterval(fetchBroadcasts, 3000)
    return () => clearInterval(interval)
  }, [])

  const getPlatformIcon = (platform: string) => {
    return platform === "YouTube" ? (
      <Youtube className="w-5 h-5 text-red-600" />
    ) : (
      <Facebook className="w-5 h-5 text-blue-600" />
    )
  }

  const liveBroadcasts = broadcasts.filter((b) => b.status === "live")

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading broadcasts...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Live Broadcasts</h1>
          <p className="text-muted-foreground">Monitor and manage live streams</p>
        </div>

        {/* Summary */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Live Broadcasts</CardTitle>
              <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{liveBroadcasts.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Viewers</CardTitle>
              <Users className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalViewers.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <Clock className="w-4 h-4 text-accent" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{broadcasts.filter((b) => b.status === "scheduled").length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Broadcasts Grid */}
        <div className="space-y-4">
          {broadcasts.map((broadcast) => (
            <Card key={broadcast.id} className={`${broadcast.status === "live" ? "border-red-600 border-2" : ""}`}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(broadcast.platform)}
                      <h3 className="font-bold text-lg">{broadcast.title}</h3>
                      <Badge variant={broadcast.status === "live" ? "default" : "secondary"}>
                        {broadcast.status.toUpperCase()}
                        {broadcast.status === "live" && " 🔴"}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">Broadcaster: {broadcast.streamer}</p>

                    <div className="flex gap-6 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users size={16} />
                        {broadcast.viewers.toLocaleString()} viewers
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock size={16} />
                        {broadcast.duration}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="bg-transparent">
                      View
                    </Button>
                    {broadcast.status === "live" && (
                      <Button size="sm" variant="destructive">
                        End Stream
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

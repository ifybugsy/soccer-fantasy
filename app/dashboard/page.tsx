"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, Trophy, TrendingUp, Users, ChevronRight, RefreshCw, Upload, X, Zap, Clock } from "lucide-react"
import { LeagueDetailsModal } from "@/components/league-details-modal"
import Link from "next/link"
import { LiveStreamButton } from "@/components/live-stream-button"
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

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedLeague, setSelectedLeague] = useState<any>(null)
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "error">("synced")
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [liveResults, setLiveResults] = useState<LiveResult[]>([])
  const [loadingResults, setLoadingResults] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/wallet")
        const data = await response.json()

        setUser({
          username: "PlayerName",
          balance: data?.balance || 1250.5,
          currency: "USD",
          position: data?.position || 45,
          leagueRank: data?.leagueRank || "Gold Division",
          totalEarnings: data?.totalEarnings || 3500,
          activeLeagues: data?.activeLeagues || 3,
        })
        setLastSyncTime(new Date())
        setSyncStatus("synced")
      } catch (error) {
        console.error("[v0] Failed to fetch user data:", error)
        setSyncStatus("error")
      } finally {
        setLoading(false)
      }
    }

    const fetchLiveResults = async () => {
      setLoadingResults(true)
      try {
        const response = await fetch("/api/v1/results/stream?limit=5")
        const data = await response.json()

        if (data.success) {
          setLiveResults(data.data)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch live results:", error)
      } finally {
        setLoadingResults(false)
      }
    }

    fetchUserData()
    fetchLiveResults()

    const syncInterval = setInterval(() => {
      fetchUserData()
      fetchLiveResults()
    }, 5000)

    return () => clearInterval(syncInterval)
  }, [])

  const handleManualSync = async () => {
    setSyncStatus("syncing")
    try {
      const response = await fetch("/api/admin/sync-data", { method: "POST" })
      if (response.ok) {
        setSyncStatus("synced")
        setLastSyncTime(new Date())
      }
    } catch (error) {
      setSyncStatus("error")
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", "profile")
      formData.append("userId", user?.id || "current-user")

      const response = await fetch("/api/admin/uploads", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setUploadedImage(data.url || URL.createObjectURL(file))
        setShowImageUpload(false)
      }
    } catch (error) {
      console.error("[v0] Failed to upload image:", error)
    } finally {
      setUploadingImage(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Live Stream and Sync Status */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome, {user?.username}</h1>
            <p className="text-muted-foreground">Your fantasy football dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <div
                  className={`w-2 h-2 rounded-full ${
                    syncStatus === "synced" ? "bg-green-500" : syncStatus === "syncing" ? "bg-yellow-500" : "bg-red-500"
                  }`}
                />
                {syncStatus === "synced" ? "Live" : syncStatus === "syncing" ? "Syncing..." : "Error"}
              </div>
              {lastSyncTime && (
                <p className="text-xs text-muted-foreground">Updated {lastSyncTime.toLocaleTimeString()}</p>
              )}
            </div>
            <Button size="sm" variant="outline" onClick={handleManualSync} disabled={syncStatus === "syncing"}>
              <RefreshCw size={16} />
            </Button>
            <LiveStreamButton size="md" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
              <Wallet className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${user?.balance?.toFixed(2) || "0.00"}</div>
              <p className="text-xs text-muted-foreground">USD</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Position</CardTitle>
              <TrendingUp className="w-4 h-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">#{user?.position}</div>
              <p className="text-xs text-muted-foreground">Global Ranking</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Leagues</CardTitle>
              <Trophy className="w-4 h-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user?.activeLeagues}</div>
              <p className="text-xs text-muted-foreground">{user?.leagueRank}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <Users className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${user?.totalEarnings}</div>
              <p className="text-xs text-muted-foreground">All Time</p>
            </CardContent>
          </Card>
        </div>

        {/* Profile Section with Image Upload */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Profile Card with Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Profile Image */}
              <div className="flex flex-col items-center gap-4">
                {uploadedImage ? (
                  <div className="relative">
                    <img
                      src={uploadedImage || "/placeholder.svg"}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-0 right-0 h-6 w-6 p-0"
                      onClick={() => setUploadedImage(null)}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                    <Users size={32} className="text-muted-foreground" />
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent hover:bg-primary/10"
                  onClick={() => setShowImageUpload(!showImageUpload)}
                >
                  <Upload size={14} /> Upload Photo
                </Button>
              </div>

              {/* Image Upload Input */}
              {showImageUpload && (
                <div className="border-2 border-dashed border-primary/50 rounded-lg p-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="w-full cursor-pointer"
                  />
                  {uploadingImage && <p className="text-xs text-muted-foreground mt-2">Uploading...</p>}
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-semibold">Username: {user?.username}</p>
                <p className="text-sm text-muted-foreground">Tier: {user?.leagueRank}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/wallet">
                <Button className="w-full">Deposit Funds</Button>
              </Link>
              <Link href="/dashboard/wallet">
                <Button variant="outline" className="w-full bg-transparent">
                  Withdraw
                </Button>
              </Link>
              <Link href="/leagues">
                <Button variant="outline" className="w-full bg-transparent">
                  Browse Leagues
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Joined Elite Premier League</span>
                <Badge>2h ago</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Won Mini Cup Prize</span>
                <Badge variant="secondary">+$50</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Player Match Found</span>
                <Badge>1d ago</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leagues Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Your Leagues</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { id: 1, name: "Elite Premier League", position: "12th of 50", points: 2450 },
              { id: 2, name: "Champions Division", position: "8th of 35", points: 3120 },
              { id: 3, name: "Rising Stars League", position: "25th of 100", points: 1890 },
            ].map((league) => (
              <Card key={league.id} className="hover:shadow-lg transition">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{league.name}</span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Position</p>
                    <p className="font-bold text-accent">{league.position}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Points</p>
                    <p className="font-bold">{league.points}</p>
                  </div>
                  <Button
                    onClick={() => setSelectedLeague(league)}
                    variant="outline"
                    className="w-full bg-transparent hover:bg-primary hover:text-primary-foreground transition"
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Live Results Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Live Results</h2>
            <Link href="/dashboard/results-stream">
              <Button variant="outline" size="sm" className="bg-transparent">
                View All
              </Button>
            </Link>
          </div>

          {loadingResults ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : liveResults.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No recent results submitted</p>
                <Link href="/dashboard/submit-result">
                  <Button className="mt-4">Submit Your First Result</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {liveResults.map((result) => (
                <Card key={result._id} className="hover:shadow-md transition">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-primary">{result.username}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div>
                            <p className="text-xs text-muted-foreground">{result.homeTeam.name}</p>
                            <p className="text-xl font-bold">{result.homeTeam.score}</p>
                          </div>
                          <p className="text-muted-foreground font-bold">—</p>
                          <div>
                            <p className="text-xs text-muted-foreground">{result.awayTeam.name}</p>
                            <p className="text-xl font-bold">{result.awayTeam.score}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={result.syncedToLeagues ? "default" : "secondary"}
                          className="flex items-center gap-1"
                        >
                          {result.syncedToLeagues ? (
                            <>
                              <Zap size={12} />
                              Live
                            </>
                          ) : (
                            <>
                              <Clock size={12} />
                              Pending
                            </>
                          )}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-2">{result.leagueType}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedLeague && (
        <LeagueDetailsModal
          leagueId={selectedLeague.id}
          leagueName={selectedLeague.name}
          position={selectedLeague.position}
          points={selectedLeague.points}
          onClose={() => setSelectedLeague(null)}
          onDeposit={() => {
            setSelectedLeague(null)
            window.location.href = "/dashboard/wallet"
          }}
          onWithdraw={() => {
            setSelectedLeague(null)
            window.location.href = "/dashboard/wallet"
          }}
          onBrowseLeagues={() => {
            setSelectedLeague(null)
            window.location.href = "/leagues"
          }}
        />
      )}
    </div>
  )
}

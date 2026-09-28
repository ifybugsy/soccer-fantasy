"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, ArrowLeft, Users, Loader2 } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/services/api-client"

export default function PlayersPage() {
  const [players, setPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterLevel, setFilterLevel] = useState<string | null>(null)
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "error">("synced")

  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true)
      setSyncStatus("syncing")
      try {
        const response = await apiClient.get("/leaderboard")
        if (response.success && Array.isArray(response.data)) {
          setPlayers(response.data)
          setSyncStatus("synced")
        }
      } catch (error) {
        console.error("[v0] Failed to fetch players:", error)
        setSyncStatus("error")
      } finally {
        setLoading(false)
      }
    }

    fetchPlayers()
    const syncInterval = setInterval(fetchPlayers, 5000)
    return () => clearInterval(syncInterval)
  }, [])

  const filteredPlayers = players.filter((player) => {
    const playerName = player.name || ""
    const matchesSearch = playerName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = !filterLevel || player.level === filterLevel
    return matchesSearch && matchesFilter
  })

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Legendary":
        return "destructive"
      case "Elite":
        return "secondary"
      case "Gold":
        return "default"
      default:
        return "outline"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-muted-foreground">Loading players...</p>
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
                <Users className="w-8 h-8 text-accent" />
                <h1 className="text-3xl font-bold">Top Players</h1>
              </div>
              <p className="text-muted-foreground">Discover and connect with the best fantasy players</p>
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

        {/* Search & Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search players by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterLevel === null ? "default" : "outline"}
                onClick={() => setFilterLevel(null)}
                className={filterLevel === null ? "" : "bg-transparent"}
              >
                All Levels
              </Button>
              <Button
                variant={filterLevel === "Legendary" ? "default" : "outline"}
                onClick={() => setFilterLevel("Legendary")}
                className={filterLevel === "Legendary" ? "" : "bg-transparent"}
              >
                Legendary
              </Button>
              <Button
                variant={filterLevel === "Elite" ? "default" : "outline"}
                onClick={() => setFilterLevel("Elite")}
                className={filterLevel === "Elite" ? "" : "bg-transparent"}
              >
                Elite
              </Button>
              <Button
                variant={filterLevel === "Gold" ? "default" : "outline"}
                onClick={() => setFilterLevel("Gold")}
                className={filterLevel === "Gold" ? "" : "bg-transparent"}
              >
                Gold
              </Button>
            </div>
          </div>
        </div>

        {/* Players Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlayers.map((player) => (
            <Card
              key={player.id}
              className="hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer"
              onClick={() => {
                setSelectedPlayer(player)
                setShowProfileModal(true)
              }}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl mb-1">{player.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{player.country}</p>
                  </div>
                  <Badge variant={getLevelColor(player.level)}>{player.level}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground text-sm">Matches</p>
                    <p className="text-2xl font-bold">{player.matches || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Win Rate</p>
                    <p className="text-2xl font-bold text-accent">{player.winRate || 0}%</p>
                  </div>
                </div>

                <div>
                  <p className="text-muted-foreground text-sm">Total Earnings</p>
                  <p className="text-xl font-bold text-primary">${(player.earnings || 0).toLocaleString()}</p>
                </div>

                <Button className="w-full" onClick={() => setShowProfileModal(true)}>
                  View Profile
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPlayers.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No players found matching your criteria</p>
          </div>
        )}

        {/* Player Profile Modal */}
        {showProfileModal && selectedPlayer && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl mb-1">{selectedPlayer.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{selectedPlayer.country}</p>
                  </div>
                  <Badge variant={getLevelColor(selectedPlayer.level)}>{selectedPlayer.level}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Matches Played</p>
                    <p className="text-2xl font-bold">{selectedPlayer.matches || 0}</p>
                  </div>
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Win Rate</p>
                    <p className="text-2xl font-bold text-accent">{selectedPlayer.winRate || 0}%</p>
                  </div>
                </div>

                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Total Earnings</p>
                  <p className="text-2xl font-bold text-primary">${(selectedPlayer.earnings || 0).toLocaleString()}</p>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1">Add as Friend</Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowProfileModal(false)}
                    className="flex-1 bg-transparent"
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/services/api-client"

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStakes, setFilterStakes] = useState<string | null>(null)
  const [selectedLeague, setSelectedLeague] = useState<any>(null)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "error">("synced")

  useEffect(() => {
    const fetchLeagues = async () => {
      setLoading(true)
      setSyncStatus("syncing")
      try {
        const response = await apiClient.get("/leagues")
        if (response.success && Array.isArray(response.data)) {
          setLeagues(response.data)
          setSyncStatus("synced")
        }
      } catch (error) {
        console.error("[v0] Failed to fetch leagues:", error)
        setSyncStatus("error")
      } finally {
        setLoading(false)
      }
    }

    fetchLeagues()
    const syncInterval = setInterval(fetchLeagues, 5000)
    return () => clearInterval(syncInterval)
  }, [])

  const filteredLeagues = leagues.filter((league) => {
    const matchesSearch =
      league.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      league.season.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = !filterStakes || league.stakes === filterStakes
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-muted-foreground">Loading leagues...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Fixed Back Navigation */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2 bg-transparent hover:bg-primary/10">
                <ArrowLeft size={16} /> Back to Home
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold mb-2">Browse Leagues</h1>
              <p className="text-muted-foreground">Join a league and start competing today</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  syncStatus === "synced" ? "bg-green-500" : syncStatus === "syncing" ? "bg-yellow-500" : "bg-red-500"
                }`}
              />
              {syncStatus === "synced" ? "Live Updates" : syncStatus === "syncing" ? "Syncing..." : "Error"}
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search leagues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStakes === null ? "default" : "outline"}
                onClick={() => setFilterStakes(null)}
                className={filterStakes === null ? "" : "bg-transparent"}
              >
                All
              </Button>
              <Button
                variant={filterStakes === "Free" ? "default" : "outline"}
                onClick={() => setFilterStakes("Free")}
                className={filterStakes === "Free" ? "" : "bg-transparent"}
              >
                Free
              </Button>
              <Button
                variant={filterStakes === "Low" ? "default" : "outline"}
                onClick={() => setFilterStakes("Low")}
                className={filterStakes === "Low" ? "" : "bg-transparent"}
              >
                Low
              </Button>
              <Button
                variant={filterStakes === "Medium" ? "default" : "outline"}
                onClick={() => setFilterStakes("Medium")}
                className={filterStakes === "Medium" ? "" : "bg-transparent"}
              >
                Medium
              </Button>
              <Button
                variant={filterStakes === "High" ? "default" : "outline"}
                onClick={() => setFilterStakes("High")}
                className={filterStakes === "High" ? "" : "bg-transparent"}
              >
                High
              </Button>
            </div>
          </div>
        </div>

        {/* Leagues Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeagues.map((league) => (
            <Card
              key={league.id}
              className="hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer"
              onClick={() => {
                setSelectedLeague(league)
                setShowJoinModal(true)
              }}
            >
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl">{league.name}</CardTitle>
                  <Badge
                    variant={
                      league.stakes === "Free"
                        ? "secondary"
                        : league.stakes === "Low"
                          ? "outline"
                          : league.stakes === "Medium"
                            ? "default"
                            : "destructive"
                    }
                  >
                    {league.stakes}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{league.season}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Entry Fee */}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entry Fee</span>
                  <span className="font-semibold">
                    {league.entryFee === 0 ? "Free" : `${league.entryFee} ${league.currency}`}
                  </span>
                </div>

                {/* Prize Pool */}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prize Pool</span>
                  <span className="font-semibold text-primary">
                    {league.currency === "NGN" ? "₦" : "$"}
                    {league.prizePool.toLocaleString()}
                  </span>
                </div>

                {/* Members */}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Members</span>
                  <span className="font-semibold">
                    {league.members} / {league.maxMembers}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-accent h-2 rounded-full"
                    style={{ width: `${(league.members / league.maxMembers) * 100}%` }}
                  ></div>
                </div>

                {/* Join Button */}
                <Button className="w-full" onClick={() => setShowJoinModal(true)}>
                  Join League
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Leagues Found Message */}
        {filteredLeagues.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No leagues found matching your criteria</p>
          </div>
        )}

        {/* Join Modal */}
        {showJoinModal && selectedLeague && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>{selectedLeague.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-accent/10 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Entry Fee</p>
                  <p className="text-2xl font-bold">
                    {selectedLeague.entryFee === 0 ? "Free" : `${selectedLeague.entryFee} ${selectedLeague.currency}`}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold">League Details</p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>
                      Prize Pool: {selectedLeague.currency === "NGN" ? "₦" : "$"}
                      {selectedLeague.prizePool.toLocaleString()}
                    </li>
                    <li>
                      Members: {selectedLeague.members} / {selectedLeague.maxMembers}
                    </li>
                    <li>Season: {selectedLeague.season}</li>
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1">Confirm & Join</Button>
                  <Button variant="outline" onClick={() => setShowJoinModal(false)} className="flex-1 bg-transparent">
                    Cancel
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

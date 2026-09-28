"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, Trophy } from "lucide-react"

interface Division {
  id: string
  name: string
  leagueId: string
  playerCount: number
  tier: "bronze" | "silver" | "gold" | "elite"
  createdAt: string
}

interface League {
  id: string
  name: string
  divisions: Division[]
  totalPlayers: number
  status: "active" | "inactive"
}

export default function LeagueManagementPage() {
  const [leagues, setLeagues] = useState<League[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showMergeModal, setShowMergeModal] = useState(false)
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>([])

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const response = await fetch("/api/admin/leagues/management")
        const data = await response.json()
        setLeagues(data.leagues || [])
      } catch (error) {
        console.error("[v0] Failed to fetch leagues:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeagues()

    // Real-time updates
    const interval = setInterval(fetchLeagues, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleCreateDivision = async (leagueId: string, formData: any) => {
    try {
      const response = await fetch("/api/admin/leagues/management/divisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leagueId,
          ...formData,
        }),
      })

      if (response.ok) {
        const newData = await response.json()
        setLeagues(newData.leagues)
        setShowCreateModal(false)
      }
    } catch (error) {
      console.error("[v0] Failed to create division:", error)
    }
  }

  const handleMergeDivisions = async (leagueId: string) => {
    try {
      const response = await fetch("/api/admin/leagues/management/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leagueId,
          divisionIds: selectedDivisions,
        }),
      })

      if (response.ok) {
        const newData = await response.json()
        setLeagues(newData.leagues)
        setShowMergeModal(false)
        setSelectedDivisions([])
      }
    } catch (error) {
      console.error("[v0] Failed to merge divisions:", error)
    }
  }

  const getTierColor = (tier: string) => {
    const colors = {
      bronze: "bg-amber-600 text-white",
      silver: "bg-slate-400 text-white",
      gold: "bg-yellow-500 text-black",
      elite: "bg-purple-600 text-white",
    }
    return colors[tier as keyof typeof colors] || ""
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading leagues...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">League Management</h1>
            <p className="text-muted-foreground">Create and manage divisions, merge players</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="flex gap-2">
            <Plus size={20} /> New Division
          </Button>
        </div>

        {/* Leagues */}
        <div className="space-y-6">
          {leagues.map((league) => (
            <Card key={league.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy size={20} className="text-primary" />
                      {league.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {league.totalPlayers} players • {league.divisions.length} divisions
                    </p>
                  </div>
                  <Badge variant={league.status === "active" ? "default" : "secondary"}>{league.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Divisions Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {league.divisions.map((division) => (
                    <div key={division.id} className="border border-border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold">{division.name}</p>
                          <Badge className={`mt-1 ${getTierColor(division.tier)}`}>{division.tier.toUpperCase()}</Badge>
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedDivisions.includes(division.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDivisions([...selectedDivisions, division.id])
                            } else {
                              setSelectedDivisions(selectedDivisions.filter((id) => id !== division.id))
                            }
                          }}
                          className="w-4 h-4"
                        />
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            <Users size={16} className="inline mr-1" />
                            Players
                          </span>
                          <span className="font-semibold">{division.playerCount}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                {selectedDivisions.length > 1 && (
                  <Button
                    onClick={() => handleMergeDivisions(league.id)}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    Merge Selected Divisions ({selectedDivisions.length})
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Create Division Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New Division</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Division Name</label>
                <input
                  type="text"
                  placeholder="e.g., Premium League"
                  className="w-full px-3 py-2 border border-border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tier</label>
                <select className="w-full px-3 py-2 border border-border rounded-lg">
                  <option value="bronze">Bronze</option>
                  <option value="silver">Silver</option>
                  <option value="gold">Gold</option>
                  <option value="elite">Elite</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">League</label>
                <select className="w-full px-3 py-2 border border-border rounded-lg">
                  {leagues.map((league) => (
                    <option key={league.id} value={league.id}>
                      {league.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  className="flex-1"
                  onClick={() => {
                    setShowCreateModal(false)
                  }}
                >
                  Create Division
                </Button>
                <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1 bg-transparent">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

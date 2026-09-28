"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap, Users } from "lucide-react"

interface MatchRequest {
  playerId: string
  leagueId: string
  stakes: string
}

export default function MatchPage() {
  const [isMatching, setIsMatching] = useState(false)
  const [matchFound, setMatchFound] = useState(false)
  const [selectedLeague, setSelectedLeague] = useState("")
  const [selectedStakes, setSelectedStakes] = useState("")
  const [matchedOpponent, setMatchedOpponent] = useState<any>(null)

  const leagues = [
    { id: 1, name: "Elite Premier", stakes: "High" },
    { id: 2, name: "Gold Division", stakes: "Medium" },
    { id: 3, name: "Silver Cup", stakes: "Low" },
    { id: 4, name: "Rookie League", stakes: "Free" },
  ]

  const handleFindMatch = async () => {
    setIsMatching(true)

    // Simulate matching process
    setTimeout(() => {
      setMatchFound(true)
      setMatchedOpponent({
        id: 123,
        username: "FootballPro",
        rating: 2850,
        winRate: 68,
        lastMatch: "2h ago",
        level: "Gold",
        avatar: "👤",
      })
      setIsMatching(false)
    }, 2000)
  }

  const handleAcceptMatch = () => {
    // Navigate to game or start match
    console.log("Match accepted")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Zap className="w-8 h-8 text-accent" /> Quick Match
          </h1>
          <p className="text-muted-foreground">Get matched with a similar skilled player instantly</p>
        </div>

        {!matchFound ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Select Your League</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* League Selection */}
              <div>
                <label className="block text-sm font-medium mb-3">Available Leagues</label>
                <div className="grid grid-cols-2 gap-3">
                  {leagues.map((league) => (
                    <button
                      key={league.id}
                      onClick={() => {
                        setSelectedLeague(league.id.toString())
                        setSelectedStakes(league.stakes)
                      }}
                      className={`p-3 border rounded-lg transition ${
                        selectedLeague === league.id.toString()
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <p className="font-semibold">{league.name}</p>
                      <p className="text-xs text-muted-foreground">{league.stakes}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Match Details */}
              {selectedLeague && (
                <Card className="bg-accent/10 border-accent/30">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Match Type</span>
                        <span className="font-semibold">1v1 Tournament</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Stakes</span>
                        <Badge variant="secondary">{selectedStakes}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-semibold">~10 minutes</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Find Match Button */}
              <Button size="lg" onClick={handleFindMatch} disabled={!selectedLeague || isMatching} className="w-full">
                {isMatching ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin">⚽</div> Finding Match...
                  </span>
                ) : (
                  "Find Match"
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Match Found Section */
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-green-500/10 to-primary/10 border-green-500/20">
              <CardHeader>
                <CardTitle className="text-center text-green-600">Match Found! 🎉</CardTitle>
              </CardHeader>
            </Card>

            {/* Opponent Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">{matchedOpponent.avatar}</div>
                  <h2 className="text-2xl font-bold">{matchedOpponent.username}</h2>
                  <p className="text-muted-foreground text-sm">Level: {matchedOpponent.level}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-muted/30 rounded-lg">
                  <div className="text-center">
                    <p className="text-muted-foreground text-sm">Rating</p>
                    <p className="text-2xl font-bold">{matchedOpponent.rating}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground text-sm">Win Rate</p>
                    <p className="text-2xl font-bold text-accent">{matchedOpponent.winRate}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground text-sm">Last Match</p>
                    <p className="text-2xl font-bold">{matchedOpponent.lastMatch}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  <Button size="lg" onClick={handleAcceptMatch} className="flex gap-2">
                    <Users size={20} /> Accept & Play
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => {
                      setMatchFound(false)
                      setMatchedOpponent(null)
                    }}
                    className="bg-transparent"
                  >
                    Find Different Match
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

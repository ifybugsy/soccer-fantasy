"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, TrendingUp, Trophy, Zap } from "lucide-react"

interface LeagueDetailsModalProps {
  leagueId: number
  leagueName: string
  position: string
  points: number
  onClose: () => void
  onDeposit: () => void
  onWithdraw: () => void
  onBrowseLeagues: () => void
}

export function LeagueDetailsModal({
  leagueId,
  leagueName,
  position,
  points,
  onClose,
  onDeposit,
  onWithdraw,
  onBrowseLeagues,
}: LeagueDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("standings")
  const [currency, setCurrency] = useState<"USD" | "NGN">("USD")

  // Mock real-time data
  const standings = [
    { rank: 1, player: "ProPlayer88", points: 2850, matches: 15, wins: 12 },
    { rank: 2, player: "FootballKing", points: 2720, matches: 15, wins: 11 },
    { rank: 3, player: "SoccerMaster", points: 2650, matches: 14, wins: 10 },
    { rank: 4, player: "ElitePlayer", points: 2580, matches: 15, wins: 9 },
    { rank: 5, player: "GoldenBoot", points: 2450, matches: 14, wins: 8 },
    { rank: 6, player: "FantasyPro", points: 2380, matches: 15, wins: 7 },
    { rank: 7, player: "GameChanger", points: 2310, matches: 14, wins: 7 },
    { rank: 8, player: "TopScorer", points: 2220, matches: 15, wins: 6 },
  ]

  const goalScorers = [
    { rank: 1, player: "ProPlayer88", goals: 45, assists: 12, efficiency: 94 },
    { rank: 2, player: "FootballKing", goals: 42, assists: 10, efficiency: 91 },
    { rank: 3, player: "SoccerMaster", goals: 38, assists: 9, efficiency: 88 },
    { rank: 4, player: "ElitePlayer", goals: 35, assists: 8, efficiency: 85 },
    { rank: 5, player: "GoldenBoot", goals: 32, assists: 7, efficiency: 82 },
  ]

  const leagueStats = {
    prizePool: 50000,
    members: 234,
    totalMatches: 150,
    entryFee: 100,
    status: "Active",
    yourPosition: 12,
    yourPoints: 2450,
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-4xl max-h-screen overflow-y-auto">
        {/* Header with Close Button */}
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b pb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-accent" />
              <div>
                <CardTitle className="text-2xl">{leagueName}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Real-time League Details</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition" aria-label="Close modal">
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* League Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Prize Pool</p>
              <p className="text-xl font-bold text-primary">${leagueStats.prizePool.toLocaleString()}</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Active Members</p>
              <p className="text-xl font-bold">{leagueStats.members}</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Your Position</p>
              <p className="text-xl font-bold text-accent">#{leagueStats.yourPosition}</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Your Points</p>
              <p className="text-xl font-bold text-primary">{leagueStats.yourPoints}</p>
            </div>
          </div>

          {/* Currency Selector */}
          <div className="flex gap-2">
            <Button
              variant={currency === "USD" ? "default" : "outline"}
              onClick={() => setCurrency("USD")}
              size="sm"
              className={currency === "USD" ? "" : "bg-transparent"}
            >
              USD
            </Button>
            <Button
              variant={currency === "NGN" ? "default" : "outline"}
              onClick={() => setCurrency("NGN")}
              size="sm"
              className={currency === "NGN" ? "" : "bg-transparent"}
            >
              NGN
            </Button>
          </div>

          {/* Tabs for Standings and Scorers */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3">
              <TabsTrigger value="standings" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Standings</span>
              </TabsTrigger>
              <TabsTrigger value="scorers" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">Top Scorers</span>
              </TabsTrigger>
            </TabsList>

            {/* Standings Tab */}
            <TabsContent value="standings" className="mt-4">
              <Card className="border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">League Standings (Real-time)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 overflow-x-auto">
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-2 p-3 border-b border-border bg-muted rounded-t font-semibold text-xs sm:text-sm">
                      <div className="col-span-1">Rank</div>
                      <div className="col-span-4">Player</div>
                      <div className="col-span-2">Points</div>
                      <div className="col-span-2">Matches</div>
                      <div className="col-span-3">Wins</div>
                    </div>

                    {/* Rows with hover effect */}
                    {standings.map((standing, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-12 gap-2 p-3 hover:bg-accent/5 rounded transition border-b border-border/50 text-xs sm:text-sm"
                      >
                        <div className="col-span-1 font-bold text-primary">
                          {standing.rank === 1
                            ? "🥇"
                            : standing.rank === 2
                              ? "🥈"
                              : standing.rank === 3
                                ? "🥉"
                                : standing.rank}
                        </div>
                        <div className="col-span-4 font-medium truncate">{standing.player}</div>
                        <div className="col-span-2 font-bold">{standing.points}</div>
                        <div className="col-span-2">{standing.matches}</div>
                        <div className="col-span-3 text-accent font-semibold">{standing.wins}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Top Scorers Tab */}
            <TabsContent value="scorers" className="mt-4">
              <Card className="border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Highest Goal Scorers (Live)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 overflow-x-auto">
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-2 p-3 border-b border-border bg-muted rounded-t font-semibold text-xs sm:text-sm">
                      <div className="col-span-1">Rank</div>
                      <div className="col-span-4">Player</div>
                      <div className="col-span-2">Goals</div>
                      <div className="col-span-2">Assists</div>
                      <div className="col-span-3">Efficiency</div>
                    </div>

                    {/* Rows with color coding */}
                    {goalScorers.map((scorer, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-12 gap-2 p-3 hover:bg-accent/5 rounded transition border-b border-border/50 text-xs sm:text-sm"
                      >
                        <div className="col-span-1 font-bold text-primary">
                          {scorer.rank === 1 ? "🥇" : scorer.rank === 2 ? "🥈" : scorer.rank === 3 ? "🥉" : scorer.rank}
                        </div>
                        <div className="col-span-4 font-medium truncate">{scorer.player}</div>
                        <div className="col-span-2 font-bold text-accent">{scorer.goals}</div>
                        <div className="col-span-2">{scorer.assists}</div>
                        <div className="col-span-3">
                          <Badge variant={scorer.efficiency > 90 ? "default" : "secondary"}>{scorer.efficiency}%</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons - Deposit, Withdraw, Browse Leagues */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t">
            <Button onClick={onDeposit} size="lg" className="flex gap-2 justify-center">
              <span>💳</span> Deposit Funds
            </Button>
            <Button
              onClick={onWithdraw}
              size="lg"
              variant="outline"
              className="flex gap-2 justify-center bg-transparent"
            >
              <span>💰</span> Withdraw
            </Button>
            <Button
              onClick={onBrowseLeagues}
              size="lg"
              variant="outline"
              className="flex gap-2 justify-center bg-transparent"
            >
              <span>🏆</span> Browse Leagues
            </Button>
          </div>

          {/* Real-time Status Indicator */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-4 border-t">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>Live data • Updates every 5 seconds</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy } from "lucide-react"

const leagueData = {
  id: 1,
  name: "Elite Premier League",
  season: "2025 S1",
  status: "Active",
  entryFee: 100,
  prizePool: 50000,
  members: 234,
  totalMatches: 150,
}

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
  { rank: 1, player: "ProPlayer88", goals: 45, assists: 12 },
  { rank: 2, player: "FootballKing", goals: 42, assists: 10 },
  { rank: 3, player: "SoccerMaster", goals: 38, assists: 9 },
  { rank: 4, player: "ElitePlayer", goals: 35, assists: 8 },
  { rank: 5, player: "GoldenBoot", goals: 32, assists: 7 },
]

export default function LeagueDetailsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-accent" />
            <h1 className="text-3xl font-bold">{leagueData.name}</h1>
            <Badge>{leagueData.status}</Badge>
          </div>
          <p className="text-muted-foreground">{leagueData.season}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Prize Pool</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">${leagueData.prizePool.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{leagueData.members}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{leagueData.totalMatches}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Entry Fee</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">${leagueData.entryFee}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="standings" className="mb-8">
          <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-3">
            <TabsTrigger value="standings">Standings</TabsTrigger>
            <TabsTrigger value="scorers">Top Scorers</TabsTrigger>
            <TabsTrigger value="info">League Info</TabsTrigger>
          </TabsList>

          {/* Standings Tab */}
          <TabsContent value="standings" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>League Standings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {/* Header */}
                  <div className="grid grid-cols-12 gap-4 p-3 border-b border-border font-semibold text-sm">
                    <div className="col-span-1">Rank</div>
                    <div className="col-span-4">Player</div>
                    <div className="col-span-2">Points</div>
                    <div className="col-span-2">Matches</div>
                    <div className="col-span-3">Wins</div>
                  </div>

                  {/* Rows */}
                  {standings.map((standing, i) => (
                    <div key={i} className="grid grid-cols-12 gap-4 p-3 hover:bg-accent/5 rounded transition">
                      <div className="col-span-1 font-bold text-primary">
                        {standing.rank === 1
                          ? "🥇"
                          : standing.rank === 2
                            ? "🥈"
                            : standing.rank === 3
                              ? "🥉"
                              : standing.rank}
                      </div>
                      <div className="col-span-4 font-medium">{standing.player}</div>
                      <div className="col-span-2 font-bold">{standing.points}</div>
                      <div className="col-span-2">{standing.matches}</div>
                      <div className="col-span-3 text-accent">{standing.wins}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Scorers Tab */}
          <TabsContent value="scorers" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Highest Goal Scorers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {/* Header */}
                  <div className="grid grid-cols-12 gap-4 p-3 border-b border-border font-semibold text-sm">
                    <div className="col-span-1">Rank</div>
                    <div className="col-span-5">Player</div>
                    <div className="col-span-3">Goals</div>
                    <div className="col-span-3">Assists</div>
                  </div>

                  {/* Rows */}
                  {goalScorers.map((scorer, i) => (
                    <div key={i} className="grid grid-cols-12 gap-4 p-3 hover:bg-accent/5 rounded transition">
                      <div className="col-span-1 font-bold text-primary">
                        {scorer.rank === 1 ? "🥇" : scorer.rank === 2 ? "🥈" : scorer.rank === 3 ? "🥉" : scorer.rank}
                      </div>
                      <div className="col-span-5 font-medium">{scorer.player}</div>
                      <div className="col-span-3 font-bold text-accent">{scorer.goals}</div>
                      <div className="col-span-3">{scorer.assists}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* League Info Tab */}
          <TabsContent value="info" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>League Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">League Name</p>
                  <p className="font-semibold">{leagueData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Season</p>
                  <p className="font-semibold">{leagueData.season}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rules & Regulations</p>
                  <ul className="text-sm space-y-2 mt-2">
                    <li className="flex gap-2">
                      <span>•</span>
                      <span>Players compete in weekly tournaments</span>
                    </li>
                    <li className="flex gap-2">
                      <span>•</span>
                      <span>Top 10 players qualify for the grand final</span>
                    </li>
                    <li className="flex gap-2">
                      <span>•</span>
                      <span>Prize distribution based on final ranking</span>
                    </li>
                    <li className="flex gap-2">
                      <span>•</span>
                      <span>All transactions subject to responsible gaming policies</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

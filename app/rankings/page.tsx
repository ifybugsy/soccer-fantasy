"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp } from "lucide-react"

const playerRankings = [
  { rank: 1, player: "ProPlayer88", level: "Legendary", wins: 250, losses: 50, winRate: 83, points: 8950 },
  { rank: 2, player: "FootballKing", level: "Legendary", wins: 238, losses: 62, winRate: 79, points: 8720 },
  { rank: 3, player: "SoccerMaster", level: "Elite", wins: 230, losses: 70, winRate: 77, points: 8580 },
  { rank: 4, player: "ElitePlayer", level: "Elite", wins: 220, losses: 80, winRate: 73, points: 8420 },
  { rank: 5, player: "GoldenBoot", level: "Elite", wins: 215, losses: 85, winRate: 72, points: 8250 },
  { rank: 6, player: "FantasyPro", level: "Gold", wins: 200, losses: 100, winRate: 67, points: 8100 },
  { rank: 7, player: "GameChanger", level: "Gold", wins: 195, losses: 105, winRate: 65, points: 7950 },
  { rank: 8, player: "TopScorer", level: "Gold", wins: 188, losses: 112, winRate: 63, points: 7800 },
]

const achievementsList = [
  { id: 1, name: "First Victory", description: "Win your first match", icon: "🏆" },
  { id: 2, name: "Streak Master", description: "Win 5 matches in a row", icon: "🔥" },
  { id: 3, name: "Goal Rush", description: "Score 50 goals total", icon: "⚽" },
  { id: 4, name: "Rich Player", description: "Earn 10,000 in total rewards", icon: "💰" },
  { id: 5, name: "Elite Status", description: "Reach Elite rank", icon: "👑" },
  { id: 6, name: "Cup Champion", description: "Win a mini cup", icon: "🏅" },
]

export default function RankingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-8 h-8 text-accent" />
            <h1 className="text-3xl font-bold">Rankings & Achievements</h1>
          </div>
          <p className="text-muted-foreground">Track your progress and unlock achievements</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="rankings">
          <TabsList className="grid w-full md:w-auto grid-cols-2">
            <TabsTrigger value="rankings">Player Rankings</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          {/* Rankings Tab */}
          <TabsContent value="rankings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Global Player Rankings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {/* Header Row */}
                  <div className="grid grid-cols-12 gap-3 p-3 border-b border-border font-semibold text-sm bg-muted/30 rounded-t-lg">
                    <div className="col-span-1">Rank</div>
                    <div className="col-span-2">Player</div>
                    <div className="col-span-1">Level</div>
                    <div className="col-span-2">Record</div>
                    <div className="col-span-2">Win %</div>
                    <div className="col-span-2">Points</div>
                  </div>

                  {/* Player Rows */}
                  {playerRankings.map((entry) => (
                    <div
                      key={entry.rank}
                      className="grid grid-cols-12 gap-3 p-3 hover:bg-accent/5 rounded transition border-b border-border last:border-0"
                    >
                      <div className="col-span-1 font-bold text-primary text-lg">
                        {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : entry.rank}
                      </div>
                      <div className="col-span-2 font-semibold truncate">{entry.player}</div>
                      <div className="col-span-1">
                        <Badge
                          variant={
                            entry.level === "Legendary" ? "default" : entry.level === "Elite" ? "secondary" : "outline"
                          }
                        >
                          {entry.level.slice(0, 3)}
                        </Badge>
                      </div>
                      <div className="col-span-2 text-sm">
                        {entry.wins}W-{entry.losses}L
                      </div>
                      <div className="col-span-2 font-semibold text-accent">{entry.winRate}%</div>
                      <div className="col-span-2 font-bold text-primary">{entry.points.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievementsList.map((achievement) => (
                <Card key={achievement.id} className="hover:shadow-lg transition-all">
                  <CardContent className="pt-6">
                    <div className="text-4xl mb-3">{achievement.icon}</div>
                    <h3 className="font-bold mb-1">{achievement.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{achievement.description}</p>
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-2/3 bg-accent rounded-full"></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">67% Completed</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Level System Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Player Level System</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { level: "Silver", minPoints: 0, maxPoints: 3000, color: "bg-gray-500" },
                { level: "Gold", minPoints: 3001, maxPoints: 6000, color: "bg-yellow-500" },
                { level: "Elite", minPoints: 6001, maxPoints: 9000, color: "bg-blue-500" },
                { level: "Legendary", minPoints: 9001, maxPoints: "∞", color: "bg-red-500" },
              ].map((levelInfo) => (
                <div key={levelInfo.level} className="p-4 border border-border rounded-lg">
                  <div className={`w-8 h-8 ${levelInfo.color} rounded-lg mb-2`}></div>
                  <p className="font-semibold">{levelInfo.level}</p>
                  <p className="text-xs text-muted-foreground">
                    {levelInfo.minPoints.toLocaleString()} - {levelInfo.maxPoints.toLocaleString()} points
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

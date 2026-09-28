"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, Flame, Zap, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const calculateTimeRemaining = (endTime: string): number => {
  const now = new Date().getTime()
  const end = new Date(endTime).getTime()
  return Math.max(0, Math.floor((end - now) / 1000))
}

const miniCups = [
  {
    id: 1,
    name: "Daily Cup",
    icon: Zap,
    prize: 5000,
    participants: 234,
    duration: "24 hours",
    status: "Active",
    startTime: "00:00 UTC",
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    entryFee: 10,
  },
  {
    id: 2,
    name: "Weekly Cup",
    icon: Trophy,
    prize: 50000,
    participants: 1240,
    duration: "7 days",
    status: "Active",
    startTime: "Monday 00:00 UTC",
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    entryFee: 50,
  },
  {
    id: 3,
    name: "Tournament Cup",
    icon: Flame,
    prize: 200000,
    participants: 5000,
    duration: "30 days",
    status: "Active",
    startTime: "1st of Month",
    endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    entryFee: 100,
  },
  {
    id: 4,
    name: "Elite Cup",
    icon: Trophy,
    prize: 500000,
    participants: 500,
    duration: "Quarterly",
    status: "Upcoming",
    startTime: "Quarterly",
    endTime: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    entryFee: 500,
  },
]

const cupWinners = [
  { rank: 1, player: "ProPlayer88", prize: 5000, cupType: "Daily" },
  { rank: 2, player: "FootballKing", prize: 2500, cupType: "Daily" },
  { rank: 3, player: "SoccerMaster", prize: 1500, cupType: "Daily" },
  { rank: 1, player: "ElitePlayer", prize: 50000, cupType: "Weekly" },
  { rank: 2, player: "GoldenBoot", prize: 25000, cupType: "Weekly" },
  { rank: 3, player: "FantasyPro", prize: 15000, cupType: "Weekly" },
]

function CountdownTimer({ endTime }: { endTime: string }) {
  const [timeLeft, setTimeLeft] = useState<number>(calculateTimeRemaining(endTime))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeRemaining(endTime))
    }, 1000)

    return () => clearInterval(interval)
  }, [endTime])

  const days = Math.floor(timeLeft / (24 * 60 * 60))
  const hours = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60))
  const minutes = Math.floor((timeLeft % (60 * 60)) / 60)
  const seconds = timeLeft % 60

  if (timeLeft === 0) {
    return <span className="text-xs text-destructive font-semibold">Ended</span>
  }

  return (
    <span className="text-xs text-accent font-semibold">
      {days > 0 ? `${days}d ` : ""}
      {hours}h {minutes}m {seconds}s
    </span>
  )
}

export default function CupsPage() {
  const [selectedCup, setSelectedCup] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [participants, setParticipants] = useState<Record<number, number>>({})
  const router = useRouter()

  useEffect(() => {
    const initialParticipants: Record<number, number> = {}
    miniCups.forEach((cup) => {
      initialParticipants[cup.id] = cup.participants
    })
    setParticipants(initialParticipants)

    // Simulate real-time participant updates
    const interval = setInterval(() => {
      setParticipants((prev) => ({
        ...prev,
        1: prev[1] ? prev[1] + Math.floor(Math.random() * 3) : 234,
        2: prev[2] ? prev[2] + Math.floor(Math.random() * 5) : 1240,
        3: prev[3] ? prev[3] + Math.floor(Math.random() * 2) : 5000,
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleJoinCup = (cup: any) => {
    router.push(
      `/cups/join/${cup.id}?cupName=${encodeURIComponent(cup.name)}&entryFee=${cup.entryFee}&prize=${cup.prize}`,
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back Home
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-accent" />
            <h1 className="text-3xl font-bold">Mini Cups & Tournaments</h1>
          </div>
          <p className="text-muted-foreground">Compete in exclusive tournaments and win big prizes</p>
        </div>

        {/* Active Cups Grid */}
        <h2 className="text-2xl font-bold mb-4">Active Cups</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {miniCups
            .filter((cup) => cup.status === "Active")
            .map((cup) => {
              const Icon = cup.icon
              return (
                <Card
                  key={cup.id}
                  className="hover:shadow-lg transition-all hover:border-accent/50 cursor-pointer relative overflow-hidden"
                  onClick={() => {
                    setSelectedCup(cup)
                    setShowDetailsModal(true)
                  }}
                >
                  {/* Background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-primary/10"></div>

                  <CardContent className="pt-6 relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <Icon className="w-8 h-8 text-accent" />
                      <Badge>{cup.status}</Badge>
                    </div>

                    <h3 className="text-xl font-bold mb-2">{cup.name}</h3>

                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Prize Pool</p>
                        <p className="text-2xl font-bold text-primary">₦{cup.prize.toLocaleString()}</p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">Participants</p>
                        <p className="font-semibold">{(participants[cup.id] || cup.participants).toLocaleString()}</p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">Time Remaining</p>
                        <CountdownTimer endTime={cup.endTime} />
                      </div>

                      <Button
                        className="w-full mt-4"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleJoinCup(cup)
                        }}
                      >
                        Join Cup
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
        </div>

        {/* Upcoming Cups */}
        {miniCups.some((cup) => cup.status === "Upcoming") && (
          <>
            <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              {miniCups
                .filter((cup) => cup.status === "Upcoming")
                .map((cup) => {
                  const Icon = cup.icon
                  return (
                    <Card key={cup.id} className="opacity-75">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <Icon className="w-8 h-8 text-muted-foreground" />
                          <Badge variant="secondary">{cup.status}</Badge>
                        </div>
                        <h3 className="text-xl font-bold mb-2">{cup.name}</h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Prize Pool</p>
                            <p className="text-2xl font-bold text-primary">₦{cup.prize.toLocaleString()}</p>
                          </div>
                          <Button disabled className="w-full mt-4">
                            Coming Soon
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          </>
        )}

        {/* Recent Winners */}
        <h2 className="text-2xl font-bold mb-4">Recent Winners</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Daily Cup Winners */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Cup Winners</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cupWinners
                  .filter((w) => w.cupType === "Daily")
                  .map((winner, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-accent/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                          {winner.rank === 1 ? "🥇" : winner.rank === 2 ? "🥈" : "🥉"}
                        </div>
                        <div>
                          <p className="font-semibold">{winner.player}</p>
                          <p className="text-xs text-muted-foreground">Rank #{winner.rank}</p>
                        </div>
                      </div>
                      <p className="font-bold text-accent">+₦{winner.prize.toLocaleString()}</p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Cup Winners */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Cup Winners</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cupWinners
                  .filter((w) => w.cupType === "Weekly")
                  .map((winner, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-accent/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                          {winner.rank === 1 ? "🥇" : winner.rank === 2 ? "🥈" : "🥉"}
                        </div>
                        <div>
                          <p className="font-semibold">{winner.player}</p>
                          <p className="text-xs text-muted-foreground">Rank #{winner.rank}</p>
                        </div>
                      </div>
                      <p className="font-bold text-accent">+₦{winner.prize.toLocaleString()}</p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cup Details Modal */}
        {showDetailsModal && selectedCup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-accent" />
                  <CardTitle>{selectedCup.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Prize Pool</p>
                    <p className="text-2xl font-bold text-accent">₦{selectedCup.prize.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Entry Fee</p>
                    <p className="text-2xl font-bold text-primary">₦{selectedCup.entryFee.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-semibold">{selectedCup.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Participants</span>
                    <span className="font-semibold">
                      {(participants[selectedCup.id] || selectedCup.participants).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start Time</span>
                    <span className="font-semibold">{selectedCup.startTime}</span>
                  </div>
                </div>

                <div className="bg-primary/10 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Prize Distribution</p>
                  <ul className="text-sm space-y-1">
                    <li className="flex justify-between">
                      <span>🥇 1st Place:</span>
                      <span className="font-semibold">₦{(selectedCup.prize * 0.5).toLocaleString()}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>🥈 2nd Place:</span>
                      <span className="font-semibold">₦{(selectedCup.prize * 0.3).toLocaleString()}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>🥉 3rd Place:</span>
                      <span className="font-semibold">₦{(selectedCup.prize * 0.2).toLocaleString()}</span>
                    </li>
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setShowDetailsModal(false)
                      handleJoinCup(selectedCup)
                    }}
                  >
                    Join Cup
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDetailsModal(false)}
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

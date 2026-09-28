"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, CheckCircle2, XCircle, Clock, AlertCircle, Eye, RefreshCw, Zap, Search } from "lucide-react"

interface MatchResult {
  _id: string
  username: string
  leagueType: string
  homeTeam: { name: string; score: number }
  awayTeam: { name: string; score: number }
  matchWinner: string
  goalScorers: Array<{ playerName: string; matchMinute: string }>
  screenshotUrl: string | null
  status: "pending" | "approved" | "rejected"
  submittedAt: string
  reviewedAt?: string
  adminNotes?: string
  syncedToLeagues: boolean
}

export default function AdminResultsPage() {
  const [results, setResults] = useState<MatchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("pending")
  const [filterLeague, setFilterLeague] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedResult, setSelectedResult] = useState<MatchResult | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [adminNotes, setAdminNotes] = useState("")
  const [processing, setProcessing] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing">("synced")
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const query = filterStatus === "all" ? "" : `?status=${filterStatus}`
        const response = await fetch(`/api/v1/results${query}`)
        const data = await response.json()
        setResults(data.data || [])
        setLastSyncTime(new Date())
        setSyncStatus("synced")
      } catch (error) {
        console.error("[v0] Failed to fetch results:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()

    // Real-time updates every 3 seconds
    const interval = setInterval(fetchResults, 3000)
    return () => clearInterval(interval)
  }, [filterStatus])

  const handleRefresh = async () => {
    setRefreshing(true)
    setSyncStatus("syncing")
    try {
      const query = filterStatus === "all" ? "" : `?status=${filterStatus}`
      const response = await fetch(`/api/v1/results${query}`)
      const data = await response.json()
      setResults(data.data || [])
      setLastSyncTime(new Date())
      setSyncStatus("synced")
    } catch (error) {
      console.error("[v0] Failed to refresh:", error)
    } finally {
      setRefreshing(false)
    }
  }

  const handleApproveResult = async () => {
    if (!selectedResult) return

    setProcessing(true)
    try {
      const response = await fetch(`/api/v1/results/${selectedResult._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "approved",
          adminNotes,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setResults((prev) => prev.map((r) => (r._id === selectedResult._id ? data.data : r)))
        setSuccessMessage("Result approved and synced to leagues!")
        setSelectedResult(null)
        setAdminNotes("")
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } catch (error) {
      console.error("[v0] Failed to approve result:", error)
    } finally {
      setProcessing(false)
    }
  }

  const handleRejectResult = async () => {
    if (!selectedResult) return

    setProcessing(true)
    try {
      const response = await fetch(`/api/v1/results/${selectedResult._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "rejected",
          adminNotes,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setResults((prev) => prev.map((r) => (r._id === selectedResult._id ? data.data : r)))
        setSuccessMessage("Result rejected!")
        setSelectedResult(null)
        setAdminNotes("")
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } catch (error) {
      console.error("[v0] Failed to reject result:", error)
    } finally {
      setProcessing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="w-4 h-4" />
      case "rejected":
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const filteredResults = results.filter((result) => {
    const matchesSearch =
      result.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.homeTeam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.awayTeam.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesLeague = filterLeague === "all" || result.leagueType === filterLeague

    return matchesSearch && matchesLeague
  })

  const pendingCount = results.filter((r) => r.status === "pending").length
  const approvedCount = results.filter((r) => r.status === "approved").length
  const rejectedCount = results.filter((r) => r.status === "rejected").length
  const syncedCount = results.filter((r) => r.syncedToLeagues).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading match results...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">Match Results Management</h1>
            </div>
            <p className="text-muted-foreground">Review and approve match result submissions from players</p>
          </div>

          {/* Sync Status */}
          <div className="text-right">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className={`w-2 h-2 rounded-full ${syncStatus === "synced" ? "bg-green-500" : "bg-yellow-500"}`} />
              {syncStatus === "synced" ? "Synced" : "Syncing..."}
            </div>
            {lastSyncTime && (
              <p className="text-xs text-muted-foreground">Last updated {lastSyncTime.toLocaleTimeString()}</p>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="mt-2 bg-transparent"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            </Button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Summary Stats */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Results</CardTitle>
              <Trophy className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{results.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="w-4 h-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rejectedCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Synced to Leagues</CardTitle>
              <Zap className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{syncedCount}</div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {(["all", "pending", "approved", "rejected"] as const).map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? "default" : "outline"}
                onClick={() => setFilterStatus(status)}
                className={filterStatus !== status ? "bg-transparent" : ""}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by player, home team, or away team..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterLeague} onValueChange={setFilterLeague}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Filter by league" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Leagues</SelectItem>
                <SelectItem value="classic">Classic League</SelectItem>
                <SelectItem value="h2h">Head-to-Head</SelectItem>
                <SelectItem value="cup">Cup Tournament</SelectItem>
                <SelectItem value="mini">Mini Cup</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-4">
          {filteredResults.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  {results.length === 0 ? "No match results found" : "No results match your filters"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredResults.map((result) => (
              <Card key={result._id} className="overflow-hidden hover:shadow-lg transition">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-5 gap-4 items-start">
                    {/* Player & League Info */}
                    <div className="md:col-span-2">
                      <p className="font-semibold text-foreground">{result.username}</p>
                      <p className="text-sm text-muted-foreground mb-2">{result.leagueType}</p>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline">{result.leagueType}</Badge>
                        <Badge className={getStatusColor(result.status)}>
                          <span className="mr-1">{getStatusIcon(result.status)}</span>
                          {result.status}
                        </Badge>
                        {result.syncedToLeagues && (
                          <Badge className="bg-blue-100 text-blue-800">
                            <Zap size={12} className="mr-1" />
                            Live
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Match Score */}
                    <div className="text-center">
                      <p className="font-semibold text-sm mb-2">{result.homeTeam.name}</p>
                      <p className="text-xl font-bold text-primary">
                        {result.homeTeam.score} - {result.awayTeam.score}
                      </p>
                      <p className="font-semibold text-sm mt-2">{result.awayTeam.name}</p>
                    </div>

                    {/* Goal Scorers */}
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">GOAL SCORERS</p>
                      {result.goalScorers.length > 0 ? (
                        <ul className="text-sm space-y-1">
                          {result.goalScorers.slice(0, 3).map((scorer, idx) => (
                            <li key={idx} className="text-foreground">
                              {scorer.playerName} ({scorer.matchMinute}')
                            </li>
                          ))}
                          {result.goalScorers.length > 3 && (
                            <li className="text-xs text-muted-foreground">+{result.goalScorers.length - 3} more</li>
                          )}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">No scorers</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedResult(result)
                          setAdminNotes(result.adminNotes || "")
                          setShowPreview(true)
                        }}
                        className="w-full bg-transparent"
                      >
                        <Eye size={16} className="mr-1" />
                        View
                      </Button>
                      {result.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedResult(result)
                              setAdminNotes("")
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white px-2"
                          >
                            ✓
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedResult(result)
                              setAdminNotes("")
                            }}
                            className="px-2"
                          >
                            ✕
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Submission Time */}
                  <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                    Submitted: {new Date(result.submittedAt).toLocaleString()}
                    {result.reviewedAt && ` • Reviewed: ${new Date(result.reviewedAt).toLocaleString()}`}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Result Detail Modal */}
        {showPreview && selectedResult && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <Card className="w-full max-w-2xl my-4">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{selectedResult.username}'s Match Result</span>
                  <Badge className={getStatusColor(selectedResult.status)}>{selectedResult.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Match Details */}
                <div className="bg-muted/50 rounded-lg p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    {new Date(selectedResult.submittedAt).toLocaleString()}
                  </p>
                  <div className="flex items-center justify-center gap-6">
                    <div>
                      <p className="font-semibold">{selectedResult.homeTeam.name}</p>
                      <p className="text-3xl font-bold text-primary">{selectedResult.homeTeam.score}</p>
                    </div>
                    <div className="text-muted-foreground text-2xl font-bold">VS</div>
                    <div>
                      <p className="font-semibold">{selectedResult.awayTeam.name}</p>
                      <p className="text-3xl font-bold text-accent">{selectedResult.awayTeam.score}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm font-semibold">
                    Winner: <Badge>{selectedResult.matchWinner}</Badge>
                  </p>
                </div>

                {/* Goal Scorers */}
                {selectedResult.goalScorers.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Goal Scorers</h4>
                    <ul className="space-y-1 text-sm">
                      {selectedResult.goalScorers.map((scorer, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span>{scorer.playerName}</span>
                          <span className="text-muted-foreground">{scorer.matchMinute}'</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Screenshot */}
                {selectedResult.screenshotUrl && (
                  <div>
                    <h4 className="font-semibold mb-2">Match Proof</h4>
                    <img
                      src={selectedResult.screenshotUrl || "/placeholder.svg"}
                      alt="Match screenshot"
                      className="w-full max-h-64 object-cover rounded-lg border border-border"
                    />
                  </div>
                )}

                {/* Admin Review (for pending) */}
                {selectedResult.status === "pending" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">Admin Notes (Optional)</label>
                      <Textarea
                        placeholder="Add notes about this submission..."
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        className="min-h-24"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={handleApproveResult}
                        disabled={processing}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        {processing ? "Processing..." : "Approve Result"}
                      </Button>
                      <Button
                        onClick={handleRejectResult}
                        disabled={processing}
                        variant="destructive"
                        className="flex-1"
                      >
                        {processing ? "Processing..." : "Reject Result"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Approved/Rejected Info */}
                {selectedResult.status !== "pending" && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{selectedResult.status.charAt(0).toUpperCase() + selectedResult.status.slice(1)}</strong>
                      {selectedResult.reviewedAt && ` on ${new Date(selectedResult.reviewedAt).toLocaleString()}`}
                      {selectedResult.adminNotes && (
                        <>
                          <br />
                          <em>{selectedResult.adminNotes}</em>
                        </>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                <Button onClick={() => setShowPreview(false)} className="w-full">
                  Close
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

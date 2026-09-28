"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import {
  Users,
  TrendingUp,
  DollarSign,
  AlertCircle,
  CreditCard,
  Download,
  FileText,
  Radio,
  Zap,
  Trophy,
  Target,
  HelpCircle,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/services/api-client"

const AdminDashboard = () => {
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [supportOpen, setSupportOpen] = useState(false)
  const [chartData, setChartData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"healthy" | "warning" | "error">("error")

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await apiClient.get("/v1/admin/dashboard/stats", { requiresAdminAuth: true })

        if (response.success && response.data?.weeklyData) {
          setChartData(response.data.weeklyData)
          setConnectionStatus("healthy")
        } else {
          const fallbackData = [
            { name: "Mon", players: 240, revenue: 2400 },
            { name: "Tue", players: 280, revenue: 2800 },
            { name: "Wed", players: 320, revenue: 2200 },
            { name: "Thu", players: 290, revenue: 2908 },
            { name: "Fri", players: 340, revenue: 2800 },
            { name: "Sat", players: 390, revenue: 3800 },
            { name: "Sun", players: 410, revenue: 3908 },
          ]
          setChartData(fallbackData)
          setConnectionStatus("warning")
        }
      } catch (err) {
        setError("Failed to load dashboard data")
        const fallbackData = [
          { name: "Mon", players: 240, revenue: 2400 },
          { name: "Tue", players: 280, revenue: 2800 },
          { name: "Wed", players: 320, revenue: 2200 },
          { name: "Thu", players: 290, revenue: 2908 },
          { name: "Fri", players: 340, revenue: 2800 },
          { name: "Sat", players: 390, revenue: 3800 },
          { name: "Sun", players: 410, revenue: 3908 },
        ]
        setChartData(fallbackData)
        setConnectionStatus("error")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
    const interval = setInterval(fetchAnalytics, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleAdminAction = async (action: string, endpoint?: string) => {
    setActionLoading(action)
    try {
      const response = await fetch(endpoint || `/api/admin/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      if (response.ok) {
        alert(`${action} completed successfully`)
      } else {
        alert(`Error: Unable to complete ${action}`)
      }
    } catch (error) {
      alert("Error completing action")
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">Monitor and manage Soccer Fantasy platform</p>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full ${
                  connectionStatus === "healthy"
                    ? "bg-green-500"
                    : connectionStatus === "warning"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
              />
              <span className="text-sm text-muted-foreground">
                {connectionStatus === "healthy"
                  ? "Connected"
                  : connectionStatus === "warning"
                    ? "Cached Data"
                    : "Offline Mode"}
              </span>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Players</CardTitle>
              <Users className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">10,234</p>
              <p className="text-xs text-green-600">+12% this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
              <DollarSign className="w-4 h-4 text-accent" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">$123,456</p>
              <p className="text-xs text-green-600">+8% this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Leagues</CardTitle>
              <TrendingUp className="w-4 h-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">542</p>
              <p className="text-xs text-green-600">+5 this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Disputes</CardTitle>
              <AlertCircle className="w-4 h-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">3</p>
              <p className="text-xs text-destructive">Requires attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Players Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Active Players This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="players" fill="hsl(var(--color-primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--color-accent))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Management Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* League Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" /> League Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/leagues/management">
                <Button variant="outline" className="w-full justify-start bg-transparent hover:bg-accent/10">
                  <FileText size={16} className="mr-2" />
                  Manage Divisions & Players
                </Button>
              </Link>
              <Link href="/admin/leagues">
                <Button variant="outline" className="w-full justify-start bg-transparent hover:bg-accent/10">
                  <TrendingUp size={16} className="mr-2" />
                  View All Leagues
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground">Create divisions, merge players, manage tiers</p>
            </CardContent>
          </Card>

          {/* Transaction Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" /> Financial Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/withdrawals">
                <Button variant="outline" className="w-full justify-start bg-transparent hover:bg-accent/10">
                  <Download size={16} className="mr-2" />
                  Approve Withdrawals (with 5% fee)
                </Button>
              </Link>
              <Link href="/admin/deposits">
                <Button variant="outline" className="w-full justify-start bg-transparent hover:bg-accent/10">
                  <CreditCard size={16} className="mr-2" />
                  Review Deposits
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground">Manage payment transactions and refunds</p>
            </CardContent>
          </Card>

          {/* User Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" /> User Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/users">
                <Button variant="outline" className="w-full justify-start bg-transparent hover:bg-accent/10">
                  <Users size={16} className="mr-2" />
                  Manage Users & Profiles
                </Button>
              </Link>
              <Link href="/admin/uploads">
                <Button variant="outline" className="w-full justify-start bg-transparent hover:bg-accent/10">
                  <AlertCircle size={16} className="mr-2" />
                  Review Image Uploads
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground">Verify accounts, suspend users, manage content</p>
            </CardContent>
          </Card>

          {/* Real-Time Sync */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="w-5 h-5" /> Real-Time Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/sync-center">
                <Button variant="outline" className="w-full justify-start bg-transparent hover:bg-accent/10">
                  <Zap size={16} className="mr-2" />
                  Data Synchronization
                </Button>
              </Link>
              <Link href="/admin/broadcasts">
                <Button variant="outline" className="w-full justify-start bg-transparent hover:bg-accent/10">
                  <Radio size={16} className="mr-2" />
                  Live Streams Management
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground">Sync leaderboards, manage broadcasts</p>
            </CardContent>
          </Card>
        </div>

        {/* Cups and Leaderboard Management sections */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Cups Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" /> Tournaments & Cups
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Link href="/admin/cups">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent hover:bg-accent/10"
                    disabled={actionLoading === "create-cup"}
                  >
                    <Trophy size={16} className="mr-2" />
                    {actionLoading === "create-cup" ? "Creating..." : "Create New Cup"}
                  </Button>
                </Link>
                <Link href="/admin/cups">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent hover:bg-accent/10"
                    disabled={actionLoading === "edit-cups"}
                  >
                    <Target size={16} className="mr-2" />
                    {actionLoading === "edit-cups" ? "Loading..." : "Edit Active Cups"}
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent hover:bg-accent/10"
                  onClick={() => handleAdminAction("reset-cups", "/api/admin/cups/reset")}
                  disabled={actionLoading === "reset-cups"}
                >
                  <Zap size={16} className="mr-2" />
                  {actionLoading === "reset-cups" ? "Resetting..." : "Reset Cup Standings"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent hover:bg-accent/10"
                  onClick={() => handleAdminAction("manage-prizes", "/api/admin/cups/prizes")}
                  disabled={actionLoading === "manage-prizes"}
                >
                  <DollarSign size={16} className="mr-2" />
                  {actionLoading === "manage-prizes" ? "Managing..." : "Manage Prize Pools"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Create, modify, or reset tournaments and mini cups</p>
            </CardContent>
          </Card>

          {/* Leaderboard Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" /> Leaderboard Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent hover:bg-accent/10"
                  onClick={() => handleAdminAction("update-global", "/api/admin/leaderboard/global")}
                  disabled={actionLoading === "update-global"}
                >
                  <TrendingUp size={16} className="mr-2" />
                  {actionLoading === "update-global" ? "Updating..." : "Update Global Rankings"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent hover:bg-accent/10"
                  onClick={() => handleAdminAction("update-country", "/api/admin/leaderboard/country")}
                  disabled={actionLoading === "update-country"}
                >
                  <Target size={16} className="mr-2" />
                  {actionLoading === "update-country" ? "Updating..." : "Update Country Rankings"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent hover:bg-accent/10"
                  onClick={() => handleAdminAction("recalculate", "/api/admin/leaderboard/recalculate")}
                  disabled={actionLoading === "recalculate"}
                >
                  <Users size={16} className="mr-2" />
                  {actionLoading === "recalculate" ? "Calculating..." : "Recalculate Scores"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent hover:bg-accent/10"
                  onClick={() => handleAdminAction("review-disputes", "/api/admin/leaderboard/disputes")}
                  disabled={actionLoading === "review-disputes"}
                >
                  <AlertCircle size={16} className="mr-2" />
                  {actionLoading === "review-disputes" ? "Loading..." : "Review Disputed Rankings"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Manage rankings, recalculate points, resolve disputes</p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Section */}
        <div className="grid md:grid-cols-1 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" /> Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-3 gap-2">
                <Link href="/admin/analytics">
                  <Button variant="outline" className="w-full justify-start bg-transparent hover:bg-accent/10">
                    <Trophy size={16} className="mr-2" />
                    View Detailed Analytics
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent hover:bg-accent/10"
                  onClick={() => handleAdminAction("export-reports", "/api/admin/analytics/export")}
                  disabled={actionLoading === "export-reports"}
                >
                  <Download size={16} className="mr-2" />
                  {actionLoading === "export-reports" ? "Exporting..." : "Export Reports"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent hover:bg-accent/10"
                  onClick={() => handleAdminAction("refresh-stats", "/api/admin/analytics/refresh")}
                  disabled={actionLoading === "refresh-stats"}
                >
                  <Zap size={16} className="mr-2" />
                  {actionLoading === "refresh-stats" ? "Refreshing..." : "Refresh Statistics"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                View detailed analytics, export reports, and refresh platform statistics
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Support Section */}
        <div className="grid md:grid-cols-1 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5" /> Support & Assistance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent hover:bg-accent/10"
                  onClick={() => setSupportOpen(true)}
                >
                  <HelpCircle size={16} className="mr-2" />
                  Contact Support
                </Button>
                <Link href="/admin/reports">
                  <Button variant="outline" className="w-full justify-start bg-transparent hover:bg-accent/10">
                    <FileText size={16} className="mr-2" />
                    View Support Tickets
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-muted-foreground">Get help or submit support requests</p>
            </CardContent>
          </Card>
        </div>

        {/* Support Modal */}
        {supportOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Issue Type</label>
                  <select className="w-full px-3 py-2 border border-border rounded-md bg-background">
                    <option>Technical Issue</option>
                    <option>Payment Issue</option>
                    <option>User Complaint</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    rows={4}
                    placeholder="Describe your issue..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setSupportOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => {
                      handleAdminAction("submit-support", "/api/admin/support")
                      setSupportOpen(false)
                    }}
                  >
                    Submit
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

export default AdminDashboard

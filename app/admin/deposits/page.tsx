"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { CheckCircle2, Clock, AlertCircle } from "lucide-react"

interface DepositTransaction {
  id: string
  userId: string
  userName: string
  amount: number
  currency: "USD" | "NGN"
  status: "pending" | "completed" | "failed"
  paymentMethod: string
  createdAt: string
}

export default function DepositsPage() {
  const [deposits, setDeposits] = useState<DepositTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "completed" | "failed">("all")

  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        const response = await fetch("/api/admin/deposits")
        const data = await response.json()
        setDeposits(data.deposits || [])
      } catch (error) {
        console.error("[v0] Failed to fetch deposits:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDeposits()

    // Real-time updates every 5 seconds
    const interval = setInterval(fetchDeposits, 5000)
    return () => clearInterval(interval)
  }, [])

  const filteredDeposits = filterStatus === "all" ? deposits : deposits.filter((d) => d.status === filterStatus)

  const stats = {
    totalDeposits: deposits.reduce((sum, d) => (d.status === "completed" ? sum + d.amount : sum), 0),
    pendingDeposits: deposits.filter((d) => d.status === "pending").length,
    completedDeposits: deposits.filter((d) => d.status === "completed").length,
    failedDeposits: deposits.filter((d) => d.status === "failed").length,
  }

  const depositsByDay = deposits.reduce(
    (acc, deposit) => {
      const day = new Date(deposit.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
      const existing = acc.find((d) => d.date === day)
      if (existing) {
        existing.amount += deposit.amount
      } else {
        acc.push({ date: day, amount: deposit.amount })
      }
      return acc
    },
    [] as Array<{ date: string; amount: number }>,
  )

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency === "NGN" ? "₦" : "$"}${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading deposits...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Deposit Transactions</h1>
          <p className="text-muted-foreground">Review and manage player deposit transactions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deposited</CardTitle>
              <CheckCircle2 className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">${stats.totalDeposits.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.completedDeposits}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="w-4 h-4 text-accent" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.pendingDeposits}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <AlertCircle className="w-4 h-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.failedDeposits}</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Deposits Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={depositsByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="hsl(var(--color-primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6">
          {(["all", "pending", "completed", "failed"] as const).map((status) => (
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

        {/* Deposits Table */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr className="text-muted-foreground">
                    <th className="text-left py-3 px-4 font-medium">Player</th>
                    <th className="text-left py-3 px-4 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 font-medium">Method</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredDeposits.map((deposit) => (
                    <tr key={deposit.id} className="hover:bg-accent/5 transition">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{deposit.userName}</p>
                          <p className="text-xs text-muted-foreground">{deposit.userId}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold">{formatCurrency(deposit.amount, deposit.currency)}</td>
                      <td className="py-3 px-4 text-xs capitalize">{deposit.paymentMethod}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            deposit.status === "completed"
                              ? "default"
                              : deposit.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {new Date(deposit.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <Button size="sm" variant="outline" className="bg-transparent">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredDeposits.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No deposits found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

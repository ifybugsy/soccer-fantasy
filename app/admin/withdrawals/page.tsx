"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Clock, DollarSign, TrendingDown } from "lucide-react"

interface WithdrawalRequest {
  id: string
  userId: string
  userName: string
  amount: number
  currency: "USD" | "NGN"
  status: "pending" | "approved" | "rejected"
  createdAt: string
  bankAccount: string
}

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject" | null>(null)

  useEffect(() => {
    // Fetch withdrawals from API
    const fetchWithdrawals = async () => {
      try {
        const response = await fetch("/api/admin/withdrawals")
        const data = await response.json()
        setWithdrawals(data.withdrawals || [])
      } catch (error) {
        console.error("[v0] Failed to fetch withdrawals:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchWithdrawals()

    // Poll for real-time updates every 5 seconds
    const interval = setInterval(fetchWithdrawals, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleApproveWithdrawal = async (withdrawal: WithdrawalRequest) => {
    setSelectedWithdrawal(withdrawal)
    setApprovalAction("approve")
    setShowApprovalModal(true)
  }

  const handleRejectWithdrawal = async (withdrawal: WithdrawalRequest) => {
    setSelectedWithdrawal(withdrawal)
    setApprovalAction("reject")
    setShowApprovalModal(true)
  }

  const confirmApproval = async () => {
    if (!selectedWithdrawal) return

    try {
      // Calculate 5% fee
      const feePercentage = 0.05
      const fee = selectedWithdrawal.amount * feePercentage
      const netAmount = selectedWithdrawal.amount - fee

      const response = await fetch("/api/admin/withdrawals/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          withdrawalId: selectedWithdrawal.id,
          userId: selectedWithdrawal.userId,
          amount: selectedWithdrawal.amount,
          fee: fee,
          netAmount: netAmount,
          currency: selectedWithdrawal.currency,
          action: approvalAction,
        }),
      })

      if (response.ok) {
        // Update local state
        setWithdrawals((prev) =>
          prev.map((w) =>
            w.id === selectedWithdrawal.id
              ? { ...w, status: approvalAction === "approve" ? "approved" : "rejected" }
              : w,
          ),
        )
        setShowApprovalModal(false)
        setSelectedWithdrawal(null)
      }
    } catch (error) {
      console.error("[v0] Failed to approve withdrawal:", error)
    }
  }

  const pendingCount = withdrawals.filter((w) => w.status === "pending").length
  const totalPending = withdrawals.filter((w) => w.status === "pending").reduce((sum, w) => sum + w.amount, 0)

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency === "NGN" ? "₦" : "$"}${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading withdrawals...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Withdrawal Requests</h1>
          <p className="text-muted-foreground">Manage and approve player withdrawal requests</p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Clock className="w-4 h-4 text-accent" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pending Amount</CardTitle>
              <TrendingDown className="w-4 h-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(totalPending, "USD")}</p>
              <p className="text-xs text-muted-foreground">Across all currencies</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fee Generated (5%)</CardTitle>
              <DollarSign className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(totalPending * 0.05, "USD")}</p>
              <p className="text-xs text-muted-foreground">Platform revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* Withdrawals Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Withdrawal Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr className="text-muted-foreground">
                    <th className="text-left py-3 px-4 font-medium">Player</th>
                    <th className="text-left py-3 px-4 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 font-medium">Fee (5%)</th>
                    <th className="text-left py-3 px-4 font-medium">Net Amount</th>
                    <th className="text-left py-3 px-4 font-medium">Account</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {withdrawals.map((withdrawal) => {
                    const fee = withdrawal.amount * 0.05
                    const netAmount = withdrawal.amount - fee
                    return (
                      <tr key={withdrawal.id} className="hover:bg-accent/5 transition">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{withdrawal.userName}</p>
                            <p className="text-xs text-muted-foreground">{withdrawal.userId}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold">
                          {formatCurrency(withdrawal.amount, withdrawal.currency)}
                        </td>
                        <td className="py-3 px-4 text-destructive font-medium">
                          {formatCurrency(fee, withdrawal.currency)}
                        </td>
                        <td className="py-3 px-4 text-primary font-medium">
                          {formatCurrency(netAmount, withdrawal.currency)}
                        </td>
                        <td className="py-3 px-4 text-xs">{withdrawal.bankAccount}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              withdrawal.status === "pending"
                                ? "secondary"
                                : withdrawal.status === "approved"
                                  ? "default"
                                  : "destructive"
                            }
                          >
                            {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground">
                          {new Date(withdrawal.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          {withdrawal.status === "pending" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApproveWithdrawal(withdrawal)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle2 size={16} />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRejectWithdrawal(withdrawal)}
                              >
                                <XCircle size={16} />
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {withdrawals.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No withdrawal requests found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Approval Modal */}
        {showApprovalModal && selectedWithdrawal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>{approvalAction === "approve" ? "Approve Withdrawal" : "Reject Withdrawal"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-accent/10 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Withdrawal Amount:</span>
                    <span className="font-semibold">
                      {formatCurrency(selectedWithdrawal.amount, selectedWithdrawal.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">5% Platform Fee:</span>
                    <span className="font-semibold text-destructive">
                      -{formatCurrency(selectedWithdrawal.amount * 0.05, selectedWithdrawal.currency)}
                    </span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between">
                    <span className="text-muted-foreground font-medium">Net Amount:</span>
                    <span className="font-bold text-primary">
                      {formatCurrency(selectedWithdrawal.amount * 0.95, selectedWithdrawal.currency)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Player:</strong> {selectedWithdrawal.userName}
                  </p>
                  <p className="text-sm">
                    <strong>Bank Account:</strong> {selectedWithdrawal.bankAccount}
                  </p>
                  <p className="text-sm">
                    <strong>Date:</strong> {new Date(selectedWithdrawal.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    className="flex-1"
                    onClick={confirmApproval}
                    variant={approvalAction === "approve" ? "default" : "destructive"}
                  >
                    {approvalAction === "approve" ? "Confirm Approval" : "Confirm Rejection"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowApprovalModal(false)
                      setSelectedWithdrawal(null)
                    }}
                    className="flex-1 bg-transparent"
                  >
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

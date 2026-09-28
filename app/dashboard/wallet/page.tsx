"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Send, TrendingUp } from "lucide-react"
import { DepositCheckout } from "./deposit-checkout"

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "deposit" | "withdraw">("overview")
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)

  const walletData = {
    balance: 1250.5,
    currency: "USD",
    totalDeposited: 5000,
    totalWithdrawn: 2500,
    totalEarned: 8250,
    accountStatus: "verified",
  }

  const transactions = [
    { id: 1, type: "deposit", amount: 500, date: "2025-01-10", status: "completed" },
    { id: 2, type: "withdrawal", amount: 200, date: "2025-01-08", status: "completed" },
    { id: 3, type: "earnings", amount: 125.5, date: "2025-01-07", status: "completed" },
    { id: 4, type: "deposit", amount: 1000, date: "2025-01-05", status: "completed" },
  ]

  if (activeTab === "deposit") {
    return <DepositCheckout />
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Wallet</h1>
          <p className="text-muted-foreground">Manage your funds and transactions</p>
        </div>

        {/* Main Balance Card */}
        <Card className="bg-gradient-to-br from-primary/20 to-accent/20 border-primary/30 mb-8">
          <CardHeader>
            <CardTitle className="text-base">Available Balance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-2">
              <span className="text-5xl font-bold">${walletData.balance}</span>
              <span className="text-xl text-muted-foreground pb-2">{walletData.currency}</span>
            </div>
            <Badge variant="secondary">{walletData.accountStatus}</Badge>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Button size="lg" onClick={() => setActiveTab("deposit")} className="flex gap-2">
            <CreditCard size={20} /> Deposit Funds
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => setShowWithdrawModal(true)}
            className="flex gap-2 bg-transparent"
          >
            <Send size={20} /> Withdraw
          </Button>
          <Button size="lg" variant="outline" className="flex gap-2 bg-transparent">
            <TrendingUp size={20} /> View Earnings
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Deposited</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">${walletData.totalDeposited}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Withdrawn</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">${walletData.totalWithdrawn}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">${walletData.totalEarned}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-accent">${walletData.balance}</p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex justify-between items-center p-4 border border-border rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold capitalize">{tx.type}</p>
                    <p className="text-sm text-muted-foreground">{tx.date}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.type === "withdrawal" ? "text-destructive" : "text-primary"}`}>
                      {tx.type === "withdrawal" ? "-" : "+"}${tx.amount}
                    </p>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Modals */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Withdraw Funds</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Amount (USD)</label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    className="w-full px-3 py-2 border border-border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Bank Account</label>
                  <select className="w-full px-3 py-2 border border-border rounded-lg">
                    <option>Select account</option>
                    <option>Personal Account</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1">Withdraw</Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowWithdrawModal(false)}
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

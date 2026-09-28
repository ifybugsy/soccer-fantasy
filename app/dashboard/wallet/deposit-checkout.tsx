"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const depositPlans = [
  { id: "starter", name: "Starter", amount: 50, bonus: 0, popular: false },
  { id: "popular", name: "Popular", amount: 100, bonus: 10, popular: true },
  { id: "pro", name: "Pro", amount: 250, bonus: 50, popular: false },
  { id: "elite", name: "Elite", amount: 500, bonus: 150, popular: false },
]

export function DepositCheckout() {
  const [selectedPlan, setSelectedPlan] = useState("popular")
  const [selectedCurrency, setSelectedCurrency] = useState("USD")
  const [paymentMethod, setPaymentMethod] = useState("card")

  const plan = depositPlans.find((p) => p.id === selectedPlan)!
  const totalAmount = plan.amount + plan.bonus

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Add Funds to Your Wallet</h1>
          <p className="text-muted-foreground">Choose a plan and complete your deposit</p>
        </div>

        {/* Deposit Plans */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {depositPlans.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => setSelectedPlan(pkg.id)}
              className={`relative p-4 border-2 rounded-lg transition ${
                selectedPlan === pkg.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              {pkg.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>}
              <p className="font-semibold mb-2">{pkg.name}</p>
              <p className="text-2xl font-bold mb-2">${pkg.amount}</p>
              {pkg.bonus > 0 && <p className="text-xs text-accent">+ ${pkg.bonus} Bonus</p>}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left: Payment Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Currency Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Currency</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button
                  onClick={() => setSelectedCurrency("USD")}
                  className={`w-full p-3 text-left border rounded-lg transition ${
                    selectedCurrency === "USD" ? "border-primary bg-primary/10" : "border-border"
                  }`}
                >
                  <p className="font-semibold">USD - US Dollar</p>
                  <p className="text-sm text-muted-foreground">$</p>
                </button>
                <button
                  onClick={() => setSelectedCurrency("NGN")}
                  className={`w-full p-3 text-left border rounded-lg transition ${
                    selectedCurrency === "NGN" ? "border-primary bg-primary/10" : "border-border"
                  }`}
                >
                  <p className="font-semibold">NGN - Nigerian Naira</p>
                  <p className="text-sm text-muted-foreground">₦</p>
                </button>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {["card", "bank", "mobile"].map((method) => (
                  <label
                    key={method}
                    className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-accent/5 transition"
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4"
                    />
                    <div>
                      <p className="font-medium capitalize">
                        {method === "card" ? "Credit/Debit Card" : method === "bank" ? "Bank Transfer" : "Mobile Money"}
                      </p>
                      <p className="text-xs text-muted-foreground">Secure payment via {method}</p>
                    </div>
                  </label>
                ))}
              </CardContent>
            </Card>

            {/* Card Details (if card is selected) */}
            {paymentMethod === "card" && (
              <Card>
                <CardHeader>
                  <CardTitle>Card Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Expiry</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 border border-border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full px-3 py-2 border border-border rounded-lg"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Order Summary */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 pb-4 border-b border-border">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deposit Amount</span>
                    <span className="font-semibold">${plan.amount}</span>
                  </div>
                  {plan.bonus > 0 && (
                    <div className="flex justify-between text-accent">
                      <span className="text-muted-foreground">Bonus</span>
                      <span className="font-semibold">+ ${plan.bonus}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center py-2 text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">${totalAmount}</span>
                </div>

                <Button size="lg" className="w-full">
                  Proceed to Payment
                </Button>

                <p className="text-xs text-muted-foreground text-center">Your payment is secured with SSL encryption</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

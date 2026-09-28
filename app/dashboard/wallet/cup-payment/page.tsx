"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trophy } from "lucide-react"
import Link from "next/link"

export default function CupPaymentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [processing, setProcessing] = useState(false)

  const cupId = searchParams.get("cupId") || ""
  const entryFee = Number.parseInt(searchParams.get("entryFee") || "0")
  const cupName = searchParams.get("cupName") || "Cup"

  const handlePayment = async () => {
    setProcessing(true)
    try {
      // Simulate payment processing
      const response = await fetch("/api/v1/payment/cup-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cupId, entryFee, paymentMethod }),
      })

      if (response.ok) {
        // Redirect to cup success page
        router.push(`/cups/join/${cupId}/success`)
      } else {
        alert("Payment failed. Please try again.")
      }
    } catch (error) {
      console.error("[v0] Payment error:", error)
      alert("Payment processing error")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/cups">
          <Button variant="outline" size="sm" className="gap-2 mb-8 bg-transparent hover:bg-primary/10">
            <ArrowLeft size={16} /> Back to Cups
          </Button>
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left: Payment Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Cup Summary */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-accent" />
                  <CardTitle>Tournament Entry</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-accent/10 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Tournament</p>
                  <p className="text-xl font-bold">{cupName}</p>
                </div>
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

            {/* Card Details */}
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
                <CardTitle>Entry Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 pb-4 border-b border-border">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Entry Fee</span>
                    <span className="font-semibold">₦{entryFee.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-2 text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">₦{entryFee.toLocaleString()}</span>
                </div>

                <Button size="lg" className="w-full" onClick={handlePayment} disabled={processing}>
                  {processing ? "Processing..." : "Complete Payment"}
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

import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const event = await request.json()

    // Handle different event types
    switch (event.type) {
      case "payment.success":
        // Update user wallet balance
        console.log("Payment successful:", event.data)
        break
      case "payment.failed":
        // Log failed payment
        console.log("Payment failed:", event.data)
        break
      case "withdrawal.completed":
        // Update withdrawal status
        console.log("Withdrawal completed:", event.data)
        break
      default:
        return NextResponse.json({ received: true })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    return NextResponse.json({ error: "Webhook error" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { paymentService } from "@/lib/db/services/payment.service"
import { paystackService } from "@/lib/paystack/paystack.service"

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-paystack-signature")
    const body = await request.text()

    if (!signature) {
      console.error("[v0] Paystack webhook missing signature")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!paystackService.verifyWebhookSignature(body, signature)) {
      console.error("[v0] Invalid Paystack webhook signature")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let event: { event?: string; data?: { reference?: string; amount?: number; currency?: string; status?: string; metadata?: { transactionId?: string } } }
    try {
      event = JSON.parse(body)
    } catch {
      return NextResponse.json({ error: "Invalid webhook" }, { status: 400 })
    }

    if (event.event !== "charge.success") return NextResponse.json({ success: true })

    const data = event.data
    const amountMinor = data?.amount
    if (!data?.reference || typeof amountMinor !== "number" || !Number.isInteger(amountMinor) || amountMinor < 0 || data.currency !== "NGN" || data.status !== "success") {
      console.error("[v0] Invalid Paystack payment data")
      return NextResponse.json({ error: "Invalid webhook" }, { status: 400 })
    }

    try {
      const result = await paymentService.completePaystackDeposit({
        reference: data.reference,
        amountMinor,
        currency: data.currency,
        transactionId: data.metadata?.transactionId,
      })
      console.log(`[v0] Paystack payment ${data.reference} ${result.completed ? "completed" : "already processed"}`)
      return NextResponse.json({ success: true, message: result.completed ? "Webhook processed" : "Already processed" })
    } catch (error) {
      const code = error instanceof Error ? error.message : ""
      if (code === "PAYMENT_NOT_FOUND" || code === "PAYMENT_DETAILS_MISMATCH" || code === "PAYMENT_NOT_PROCESSABLE") {
        console.error(`[v0] Paystack payment rejected: ${code}`)
        return NextResponse.json({ error: "Invalid payment" }, { status: 400 })
      }
      throw error
    }
  } catch (error) {
    console.error("[v0] Paystack webhook error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook processing failed" },
      { status: 500 },
    )
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { paymentService } from "@/lib/db/services/payment.service"

export async function POST(request: NextRequest) {
  try {
    // In production, verify the webhook signature to ensure it's from the payment provider
    const signature = request.headers.get("x-webhook-signature")
    // validateWebhookSignature(signature, request) - implement based on your provider

    const webhookData = await request.json()

    console.log("[v0] Processing webhook:", webhookData)

    const transaction = await paymentService.processPaymentWebhook(webhookData)

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Webhook processed",
    })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

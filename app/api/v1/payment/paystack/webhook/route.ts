import { type NextRequest, NextResponse } from "next/server"
import { userService } from "@/lib/db/services/user.service"
import { transactionService } from "@/lib/db/services/transaction.service"
import { paystackService } from "@/lib/paystack/paystack.service"

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-paystack-signature")
    const body = await request.text()

    if (!signature) {
      return NextResponse.json({ error: "Missing webhook signature" }, { status: 400 })
    }

    const isValidSignature = paystackService.verifyWebhookSignature(JSON.parse(body), signature)

    if (!isValidSignature) {
      console.error("[v0] Invalid Paystack webhook signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 })
    }

    const event = JSON.parse(body)

    if (event.event !== "charge.success") {
      // Only process successful charges
      return NextResponse.json({ success: true })
    }

    const { reference, amount, metadata } = event.data

    if (!metadata || !metadata.transactionId || !metadata.userId) {
      console.error("[v0] Missing metadata in webhook")
      return NextResponse.json({ error: "Invalid webhook data" }, { status: 400 })
    }

    const transactionId = metadata.transactionId
    const userId = metadata.userId

    // Update transaction status
    await transactionService.updateTransactionStatus(transactionId, "completed")

    // Update user balance
    const user = await userService.getUserById(userId)
    if (user) {
      const amountInRegularUnits = amount / 100
      await userService.updateUser(userId, {
        balance: user.balance + amountInRegularUnits,
      })
    }

    console.log(`[v0] Webhook processed: Transaction ${transactionId} marked as completed`)

    return NextResponse.json({ success: true, message: "Webhook processed" })
  } catch (error) {
    console.error("[v0] Paystack webhook error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook processing failed" },
      { status: 500 },
    )
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { transactionService } from "@/lib/db/services/transaction.service"
import { paymentService } from "@/lib/db/services/payment.service"
import { paystackService } from "@/lib/paystack/paystack.service"

export async function POST(request: NextRequest) {
  try {
    const { reference, transactionId } = await request.json()

    if (!reference || !transactionId) {
      return NextResponse.json({ error: "Missing reference or transaction ID" }, { status: 400 })
    }

    const verificationResult = await paystackService.verifyPayment(reference)
    const transaction = await transactionService.getTransactionById(transactionId)

    if (!transaction || transaction.providerReference !== verificationResult.reference || transaction.type !== "deposit") {
      return NextResponse.json({ error: "Invalid payment" }, { status: 400 })
    }

    if (verificationResult.status !== "success") {
      if (transaction.status === "pending") await transactionService.updateTransactionStatus(transactionId, "failed")
      return NextResponse.json({ success: false, transactionId, status: "failed", message: "Payment verification failed" }, { status: 400 })
    }

    if (verificationResult.currency !== transaction.currency || verificationResult.amountMinor !== Math.round(transaction.amount * 100)) {
      return NextResponse.json({ error: "Invalid payment" }, { status: 400 })
    }

    try {
      const result = await paymentService.completePaystackDeposit({
        reference: verificationResult.reference,
        amountMinor: verificationResult.amountMinor,
        currency: verificationResult.currency,
        transactionId,
      })
      return NextResponse.json({ success: true, transactionId, amount: transaction.amount, currency: transaction.currency, status: "completed", alreadyProcessed: !result.completed, reference: verificationResult.reference, message: "Payment verified successfully" })
    } catch (error) {
      if (error instanceof Error && ["PAYMENT_DETAILS_MISMATCH", "PAYMENT_NOT_PROCESSABLE", "PAYMENT_NOT_FOUND"].includes(error.message)) return NextResponse.json({ error: "Invalid payment" }, { status: 400 })
      throw error
    }
  } catch (error) {
    console.error("[v0] Paystack verification error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Verification failed" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { userService } from "@/lib/db/services/user.service"
import { transactionService } from "@/lib/db/services/transaction.service"
import { paystackService } from "@/lib/paystack/paystack.service"

export async function POST(request: NextRequest) {
  try {
    const { reference, transactionId } = await request.json()

    if (!reference || !transactionId) {
      return NextResponse.json({ error: "Missing reference or transaction ID" }, { status: 400 })
    }

    const verificationResult = await paystackService.verifyPayment(reference)

    if (verificationResult.status !== "success") {
      // Update transaction as failed
      await transactionService.updateTransactionStatus(transactionId, "failed")

      return NextResponse.json(
        {
          success: false,
          transactionId,
          status: "failed",
          message: "Payment verification failed",
        },
        { status: 400 },
      )
    }

    // Get the transaction from database
    const transaction = await transactionService.getTransactionById(transactionId)
    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // Update transaction as completed
    await transactionService.updateTransactionStatus(transactionId, "completed")

    // Update user balance
    const user = await userService.getUserById(transaction.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const updatedUser = await userService.updateUser(transaction.userId, {
      balance: user.balance + transaction.amount,
    })

    return NextResponse.json({
      success: true,
      transactionId,
      amount: transaction.amount,
      currency: transaction.currency,
      status: "completed",
      newBalance: updatedUser?.balance,
      reference: verificationResult.reference,
      message: "Payment verified and balance updated successfully",
    })
  } catch (error) {
    console.error("[v0] Paystack verification error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Verification failed" }, { status: 500 })
  }
}

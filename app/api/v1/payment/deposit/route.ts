import { type NextRequest, NextResponse } from "next/server"
import { userService } from "@/lib/db/services/user.service"
import { transactionService } from "@/lib/db/services/transaction.service"

export async function POST(request: NextRequest) {
  try {
    const { userId, amount, currency, paymentMethod, stripeToken } = await request.json()

    if (!userId || !amount || !currency) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 })
    }

    const user = await userService.getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const transactionId = Math.random().toString(36).substr(2, 9).toUpperCase()

    // Create pending transaction
    const transaction = await transactionService.createTransaction({
      id: transactionId,
      userId,
      type: "deposit",
      amount,
      currency,
      status: "pending",
      description: `Deposit via ${paymentMethod}`,
    })

    // In production, integrate with actual payment provider (Stripe, PayPal, etc.)
    // Simulate payment processing
    const isSuccessful = Math.random() > 0.05 // 95% success rate

    if (isSuccessful) {
      // Update transaction status
      await transactionService.updateTransactionStatus(transactionId, "completed")

      // Add balance to user
      const updatedUser = await userService.updateUser(userId, {
        balance: user.balance + amount,
      })

      return NextResponse.json({
        success: true,
        transactionId,
        amount,
        currency,
        status: "completed",
        newBalance: updatedUser?.balance,
        message: "Deposit processed successfully",
      })
    } else {
      await transactionService.updateTransactionStatus(transactionId, "failed")
      return NextResponse.json(
        {
          success: false,
          transactionId,
          status: "failed",
          message: "Payment processing failed",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("[v0] Deposit error:", error)
    return NextResponse.json({ error: "Deposit processing error" }, { status: 500 })
  }
}

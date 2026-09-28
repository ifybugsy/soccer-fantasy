import { type NextRequest, NextResponse } from "next/server"
import { userService } from "@/lib/db/services/user.service"
import { transactionService } from "@/lib/db/services/transaction.service"
import { authErrorResponse, requireAuthenticatedUser } from "@/lib/auth/user-auth"

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, bankAccount } = await request.json()
    const user = await requireAuthenticatedUser(request)
    const userId = user.id

    if (!amount || !currency) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 })
    }

    const accountUser = await userService.getUserById(userId)
    if (!accountUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (accountUser.balance < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    const transactionId = Math.random().toString(36).substr(2, 9).toUpperCase()

    // Create pending transaction
    const transaction = await transactionService.createTransaction({
      id: transactionId,
      userId,
      type: "withdrawal",
      amount,
      currency,
      status: "pending",
      description: `Withdrawal to bank account ending in ${bankAccount?.slice(-4)}`,
    })

    // Deduct balance (pending)
    await userService.updateUser(userId, {
      balance: accountUser.balance - amount,
    })

    // In production, process via payment provider's payout system
    // For now, simulate processing
    setTimeout(async () => {
      // Simulate payout completion
      await transactionService.updateTransactionStatus(transactionId, "completed")
    }, 5000)

    return NextResponse.json({
      success: true,
      transactionId,
      amount,
      currency,
      status: "pending",
      message: "Withdrawal request submitted. Processing will complete within 1-2 business days",
    })
  } catch (error) {
    const authError = authErrorResponse(error)
    if (error instanceof Error && error.name === "UserAuthError") {
      return NextResponse.json({ error: authError.error }, { status: authError.status })
    }
    console.error("[v0] Withdrawal error:", error)
    return NextResponse.json({ error: "Withdrawal processing error" }, { status: 500 })
  }
}

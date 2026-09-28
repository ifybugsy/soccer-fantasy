import { type NextRequest, NextResponse } from "next/server"
import { transactionService } from "@/lib/db/services/transaction.service"

export async function GET(request: NextRequest) {
  try {
    const transactionId = request.nextUrl.searchParams.get("transactionId")

    if (!transactionId) {
      return NextResponse.json({ error: "Transaction ID required" }, { status: 400 })
    }

    // In production, fetch from database and verify payment with provider
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const transactions = await transactionService.getUserTransactions(userId, 1)
    const transaction = transactions.find((t) => t.id === transactionId)

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: transaction,
    })
  } catch (error) {
    console.error("[v0] Verify payment error:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { userService } from "@/lib/db/services/user.service"
import { transactionService } from "@/lib/db/services/transaction.service"
import { authErrorResponse, requireAuthenticatedUser } from "@/lib/auth/user-auth"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser(request)
    const userId = user.id

    const transactions = await transactionService.getUserTransactions(userId)

    return NextResponse.json({
      success: true,
      data: {
        balance: user.balance,
        transactions,
      },
    })
  } catch (error) {
    const authError = authErrorResponse(error)
    if (error instanceof Error && error.name === "UserAuthError") {
      return NextResponse.json({ error: authError.error }, { status: authError.status })
    }
    console.error("[v0] Get wallet error:", error)
    return NextResponse.json({ error: "Failed to fetch wallet" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { amount, type } = await request.json()
    const authenticatedUser = await requireAuthenticatedUser(request)
    const userId = authenticatedUser.id

    if (!amount || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const user = await userService.getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (type === "withdrawal" && user.balance < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    const transaction = await transactionService.createTransaction({
      id: Math.random().toString(36).substr(2, 9),
      userId,
      type: type as any,
      amount,
      currency: "USD",
      status: "pending",
      description: `${type === "deposit" ? "Deposit" : "Withdrawal"} transaction`,
    })

    return NextResponse.json({ success: true, data: transaction }, { status: 201 })
  } catch (error) {
    const authError = authErrorResponse(error)
    if (error instanceof Error && error.name === "UserAuthError") {
      return NextResponse.json({ error: authError.error }, { status: authError.status })
    }
    console.error("[v0] Wallet transaction error:", error)
    return NextResponse.json({ error: "Transaction failed" }, { status: 500 })
  }
}

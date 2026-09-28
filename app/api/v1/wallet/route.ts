import { type NextRequest, NextResponse } from "next/server"
import { userService } from "@/lib/db/services/user.service"
import { transactionService } from "@/lib/db/services/transaction.service"

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const user = await userService.getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const transactions = await transactionService.getUserTransactions(userId)

    return NextResponse.json({
      success: true,
      data: {
        balance: user.balance,
        transactions,
      },
    })
  } catch (error) {
    console.error("[v0] Get wallet error:", error)
    return NextResponse.json({ error: "Failed to fetch wallet" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, amount, type } = await request.json()

    if (!userId || !amount || !type) {
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
    console.error("[v0] Wallet transaction error:", error)
    return NextResponse.json({ error: "Transaction failed" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { userService } from "@/lib/db/services/user.service"
import { transactionService } from "@/lib/db/services/transaction.service"
import { paystackService } from "@/lib/paystack/paystack.service"

export async function POST(request: NextRequest) {
  try {
    const { userId, amount, bankCode, accountNumber, accountName } = await request.json()

    if (!userId || !amount || !bankCode || !accountNumber || !accountName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 })
    }

    if (amount < 100) {
      return NextResponse.json({ error: "Minimum withdrawal is 100 units" }, { status: 400 })
    }

    const user = await userService.getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.balance < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    const recipientResponse = await paystackService.createTransferRecipient(accountNumber, bankCode, accountName)

    if (!recipientResponse.success) {
      return NextResponse.json({ error: "Failed to create transfer recipient" }, { status: 400 })
    }

    const transferResponse = await paystackService.initiateTransfer(
      amount,
      recipientResponse.recipientCode,
      `Withdrawal for ${user.email}`,
    )

    if (!transferResponse.success) {
      return NextResponse.json({ error: "Failed to initiate transfer" }, { status: 400 })
    }

    // Deduct amount from user balance immediately
    await userService.updateUser(userId, {
      balance: user.balance - amount,
    })

    // Create transaction record
    const transactionId = Math.random().toString(36).substr(2, 9).toUpperCase()
    await transactionService.createTransaction({
      id: transactionId,
      userId,
      type: "withdrawal",
      amount,
      currency: "NGN",
      status: "pending",
      description: `Withdrawal to bank account`,
      externalId: transferResponse.reference,
    })

    return NextResponse.json({
      success: true,
      transactionId,
      transferCode: transferResponse.transferCode,
      reference: transferResponse.reference,
      amount,
      status: "pending",
      newBalance: user.balance - amount,
      message: "Withdrawal initiated. Processing will complete within 1-2 business days",
    })
  } catch (error) {
    console.error("[v0] Paystack withdrawal error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Withdrawal processing error" },
      { status: 500 },
    )
  }
}

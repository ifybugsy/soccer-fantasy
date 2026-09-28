import { type NextRequest, NextResponse } from "next/server"
import { userService } from "@/lib/db/services/user.service"
import { transactionService } from "@/lib/db/services/transaction.service"
import { paystackService } from "@/lib/paystack/paystack.service"
import { authErrorResponse, requireAuthenticatedUser } from "@/lib/auth/user-auth"

export async function POST(request: NextRequest) {
  try {
    const { amount, bankCode, accountNumber, accountName } = await request.json()
    const user = await requireAuthenticatedUser(request)
    const userId = user.id

    if (!amount || !bankCode || !accountNumber || !accountName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 })
    }

    if (amount < 100) {
      return NextResponse.json({ error: "Minimum withdrawal is 100 units" }, { status: 400 })
    }

    const accountUser = await userService.getUserById(userId)
    if (!accountUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (accountUser.balance < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    const recipientResponse = await paystackService.createTransferRecipient(accountNumber, bankCode, accountName)

    if (!recipientResponse.success) {
      return NextResponse.json({ error: "Failed to create transfer recipient" }, { status: 400 })
    }

    const transferResponse = await paystackService.initiateTransfer(
      amount,
      recipientResponse.recipientCode,
      `Withdrawal for ${accountUser.email}`,
    )

    if (!transferResponse.success) {
      return NextResponse.json({ error: "Failed to initiate transfer" }, { status: 400 })
    }

    // Deduct amount from user balance immediately
    await userService.updateUser(userId, {
      balance: accountUser.balance - amount,
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
      newBalance: accountUser.balance - amount,
      message: "Withdrawal initiated. Processing will complete within 1-2 business days",
    })
  } catch (error) {
    const authError = authErrorResponse(error)
    if (error instanceof Error && error.name === "UserAuthError") {
      return NextResponse.json({ error: authError.error }, { status: authError.status })
    }
    console.error("[v0] Paystack withdrawal error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Withdrawal processing error" },
      { status: 500 },
    )
  }
}

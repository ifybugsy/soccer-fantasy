import { type NextRequest, NextResponse } from "next/server"
import { userService } from "@/lib/db/services/user.service"
import { transactionService } from "@/lib/db/services/transaction.service"
import { paystackService } from "@/lib/paystack/paystack.service"

export async function POST(request: NextRequest) {
  try {
    const { userId, amount, currency } = await request.json()

    if (!userId || !amount || !currency) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 })
    }

    if (amount < 1) {
      return NextResponse.json({ error: "Minimum deposit is 1 unit" }, { status: 400 })
    }

    const user = await userService.getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create pending transaction
    const transactionId = Math.random().toString(36).substr(2, 9).toUpperCase()
    await transactionService.createTransaction({
      id: transactionId,
      userId,
      type: "deposit",
      amount,
      currency,
      status: "pending",
      description: `Deposit via Paystack`,
    })

    const paystackResponse = await paystackService.initializePayment(amount, user.email, {
      transactionId,
      userId,
      currency,
    })

    return NextResponse.json({
      success: true,
      transactionId,
      reference: paystackResponse.reference,
      authorizationUrl: paystackResponse.authorizationUrl,
      accessCode: paystackResponse.accessCode,
      message: "Payment initialized. Redirect user to authorization URL.",
    })
  } catch (error) {
    console.error("[v0] Paystack initialization error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Deposit initialization failed" },
      { status: 500 },
    )
  }
}

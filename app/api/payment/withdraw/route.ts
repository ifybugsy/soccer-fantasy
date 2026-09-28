import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { userId, amount, currency, bankDetails } = await request.json()

  try {
    // Validation
    if (amount < 10) {
      return NextResponse.json({ error: "Minimum withdrawal is $10" }, { status: 400 })
    }

    const withdrawalId = `WD${Date.now()}`

    // In production, integrate with payment gateway for withdrawal
    return NextResponse.json({
      success: true,
      withdrawalId,
      amount,
      currency,
      status: "pending",
      estimatedCompletion: "2-3 business days",
    })
  } catch (error) {
    return NextResponse.json({ error: "Withdrawal error" }, { status: 500 })
  }
}

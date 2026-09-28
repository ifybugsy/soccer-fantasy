import { type NextRequest, NextResponse } from "next/server"
import { paymentService } from "@/lib/db/services/payment.service"

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const type = request.nextUrl.searchParams.get("type") || undefined
    const limit = Math.min(Number(request.nextUrl.searchParams.get("limit")) || 50, 200)

    const transactions = await paymentService.getTransactionHistory(userId, type, limit)

    return NextResponse.json({
      success: true,
      data: transactions,
    })
  } catch (error) {
    console.error("[v0] Get transactions error:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}

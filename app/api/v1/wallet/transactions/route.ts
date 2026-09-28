import { type NextRequest, NextResponse } from "next/server"
import { paymentService } from "@/lib/db/services/payment.service"
import { authErrorResponse, requireAuthenticatedUser } from "@/lib/auth/user-auth"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser(request)
    const userId = user.id

    const type = request.nextUrl.searchParams.get("type") || undefined
    const limit = Math.min(Number(request.nextUrl.searchParams.get("limit")) || 50, 200)

    const transactions = await paymentService.getTransactionHistory(userId, type, limit)

    return NextResponse.json({
      success: true,
      data: transactions,
    })
  } catch (error) {
    const authError = authErrorResponse(error)
    if (error instanceof Error && error.name === "UserAuthError") {
      return NextResponse.json({ error: authError.error }, { status: authError.status })
    }
    console.error("[v0] Get transactions error:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}

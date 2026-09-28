import { type NextRequest, NextResponse } from "next/server"
import { paystackService } from "@/lib/paystack/paystack.service"

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 })
    }

    const transferDetails = await paystackService.getTransferDetails(reference)

    if (!transferDetails.success) {
      return NextResponse.json({ error: "Failed to get transfer details" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      status: transferDetails.status,
      amount: transferDetails.amount,
      reference: transferDetails.reference,
    })
  } catch (error) {
    console.error("[v0] Get transfer status error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get status" },
      { status: 500 },
    )
  }
}

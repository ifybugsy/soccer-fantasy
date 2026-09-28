import { type NextRequest, NextResponse } from "next/server"
import { adminService } from "@/lib/db/services/admin.service"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminToken = request.headers.get("x-admin-token")
    if (!adminToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { amount, reason } = await request.json()

    if (!amount || !reason) {
      return NextResponse.json({ error: "Amount and reason required" }, { status: 400 })
    }

    const updatedUser = await adminService.updateUserBalance(id, amount, reason)

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
    })
  } catch (error) {
    console.error("[v0] Update balance error:", error)
    return NextResponse.json({ error: "Failed to update balance" }, { status: 500 })
  }
}

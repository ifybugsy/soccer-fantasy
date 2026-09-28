import { type NextRequest, NextResponse } from "next/server"
import { adminService } from "@/lib/db/services/admin.service"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminToken = request.headers.get("x-admin-token")
    if (!adminToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { action } = await request.json() // 'suspend' or 'unsuspend'

    let result
    if (action === "suspend") {
      result = await adminService.suspendUser(id)
    } else if (action === "unsuspend") {
      result = await adminService.unsuspendUser(id)
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    if (!result) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("[v0] Suspend user error:", error)
    return NextResponse.json({ error: "Failed to suspend user" }, { status: 500 })
  }
}

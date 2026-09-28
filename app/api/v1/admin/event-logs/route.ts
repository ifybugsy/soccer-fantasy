import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/admin/admin-auth"
import { adminService } from "@/lib/db/services/admin.service"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    if (!verifyAdminToken(token)) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    const userId = request.nextUrl.searchParams.get("userId") || undefined
    const limit = Math.min(Number(request.nextUrl.searchParams.get("limit")) || 100, 500)

    const logs = await adminService.getEventLogs(userId, limit)

    return NextResponse.json(
      {
        success: true,
        data: logs,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Get event logs error:", error)
    return NextResponse.json({ error: "Failed to fetch event logs" }, { status: 500 })
  }
}

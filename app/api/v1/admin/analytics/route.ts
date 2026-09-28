import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { adminService } from "@/lib/db/services/admin.service"

export async function GET(request: NextRequest) {
  try {
    const adminToken = request.headers.get("x-admin-token")
    if (!adminToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const analytics = await adminService.getAnalytics()

    return NextResponse.json({
      success: true,
      data: analytics,
    })
  } catch (error) {
    console.error("[v0] Get analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}

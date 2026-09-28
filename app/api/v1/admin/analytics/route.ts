import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { adminService } from "@/lib/db/services/admin.service"
import { requireAdmin } from "@/lib/admin/admin-auth-server"

export async function GET(request: NextRequest) {
  try {
    const auth = requireAdmin(request)
    if ("response" in auth) return auth.response

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

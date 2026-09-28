import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/admin/admin-auth"

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

    return NextResponse.json(
      {
        success: true,
        authenticated: true,
        message: "Admin authenticated",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Admin auth check error:", error)
    return NextResponse.json({ error: "Authentication check failed" }, { status: 500 })
  }
}

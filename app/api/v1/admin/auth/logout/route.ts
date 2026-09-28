import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/admin/admin-auth"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    if (!verifyAdminToken(token)) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const response = NextResponse.json(
      {
        success: true,
        message: "Admin logout successful",
      },
      { status: 200 },
    )

    console.log("[v0] Admin logout successful")

    return response
  } catch (error) {
    console.error("[v0] Admin logout error:", error)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}

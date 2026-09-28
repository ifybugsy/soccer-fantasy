import { type NextRequest, NextResponse } from "next/server"
import { verifyPassword, generateAdminToken, ADMIN_CREDENTIALS } from "@/lib/admin/admin-auth"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 })
    }

    // Verify credentials
    if (username !== ADMIN_CREDENTIALS.username) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    if (!verifyPassword(password, ADMIN_CREDENTIALS.passwordHash)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate token
    const token = generateAdminToken()

    // Set secure HTTP-only cookie
    const response = NextResponse.json(
      {
        success: true,
        token,
        message: "Admin login successful",
      },
      { status: 200 },
    )

    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60,
      path: "/",
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { error: "Login failed - " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 },
    )
  }
}

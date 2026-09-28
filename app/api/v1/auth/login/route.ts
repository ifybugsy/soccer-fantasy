import { type NextRequest, NextResponse } from "next/server"
import { userService } from "@/lib/db/services/user.service"
import { adminService } from "@/lib/db/services/admin.service"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 })
    }
    if (!password) {
      return NextResponse.json({ success: false, error: "Password is required" }, { status: 400 })
    }

    let user
    try {
      user = await userService.getUserByEmail(email)
    } catch (dbError) {
      console.error("[v0] Database error:", dbError)
      return NextResponse.json({ success: false, error: "Database error - please try again later" }, { status: 503 })
    }

    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 })
    }

    if (!user.password) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 })
    }

    let isPasswordValid = false
    try {
      isPasswordValid = await userService.verifyPassword(password, user.password)
    } catch (hashError) {
      console.error("[v0] Hash error:", hashError)
      return NextResponse.json({ success: false, error: "Authentication failed" }, { status: 500 })
    }

    if (!isPasswordValid) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 })
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        {
          success: false,
          error: "Email not verified",
          requiresVerification: true,
          userId: user.id,
        },
        { status: 403 },
      )
    }

    try {
      await adminService.logEvent({
        id: Math.random().toString(36).substr(2, 9),
        type: "user_login",
        userId: user.id,
        data: {
          email,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date(),
      })
    } catch (logError) {
      // Silently fail - don't block login if logging fails
    }

    return NextResponse.json(
      {
        success: true,
        userId: user.id,
        username: user.username,
        email: user.email,
        emailVerified: user.emailVerified,
        token: user.id,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ success: false, error: "Login failed" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { userService } from "@/lib/db/services/user.service"
import { brevoService } from "@/lib/email/brevo.service"

// Rate limiting store
const resendAttempts = new Map<string, number[]>()

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }

    // Rate limiting: max 3 resends per hour
    const attempts = resendAttempts.get(email) || []
    const oneHourAgo = Date.now() - 60 * 60 * 1000

    const recentAttempts = attempts.filter((timestamp) => timestamp > oneHourAgo)

    if (recentAttempts.length >= 3) {
      return NextResponse.json({ error: "Too many resend attempts, please try again later" }, { status: 429 })
    }

    // Check if user exists
    const user = await userService.getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Send email
    const emailSent = await brevoService.sendVerificationEmail(email, verificationCode)

    if (!emailSent) {
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    // Track attempt
    recentAttempts.push(Date.now())
    resendAttempts.set(email, recentAttempts)

    console.log(`[v0] Resend verification email to ${email}`)

    return NextResponse.json(
      {
        success: true,
        message: "Verification code resent",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Resend verification error:", error)
    return NextResponse.json({ error: "Resend failed" }, { status: 500 })
  }
}

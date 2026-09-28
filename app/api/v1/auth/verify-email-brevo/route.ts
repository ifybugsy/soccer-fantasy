import { type NextRequest, NextResponse } from "next/server"
import { userService } from "@/lib/db/services/user.service"
import { brevoService } from "@/lib/email/brevo.service"

// In-memory store for verification codes (use Redis in production)
const verificationCodes = new Map<string, { code: string; expiresAt: number; attempts: number }>()

export async function POST(request: NextRequest) {
  try {
    const { action, email, code } = await request.json()

    if (!action || !email) {
      return NextResponse.json({ error: "Action and email required" }, { status: 400 })
    }

    if (action === "send") {
      // Check if user exists
      const user = await userService.getUserByEmail(email)
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      // Check if already verified
      if (user.emailVerified) {
        return NextResponse.json({ error: "Email already verified" }, { status: 400 })
      }

      // Rate limiting: only allow 3 attempts per 15 minutes
      const existing = verificationCodes.get(email)
      if (existing && existing.expiresAt > Date.now() && existing.attempts >= 3) {
        return NextResponse.json({ error: "Too many verification attempts, please try again later" }, { status: 429 })
      }

      // Generate 6-digit code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
      const expiresAt = Date.now() + 30 * 60 * 1000 // 30 minutes

      verificationCodes.set(email, {
        code: verificationCode,
        expiresAt,
        attempts: (existing?.attempts || 0) + 1,
      })

      // Send email via Brevo
      const emailSent = await brevoService.sendVerificationEmail(email, verificationCode)

      if (!emailSent) {
        return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
      }

      console.log(`[v0] Verification email sent to ${email}`)

      return NextResponse.json(
        {
          success: true,
          message: "Verification code sent to your email",
          expiresIn: 30 * 60, // seconds
        },
        { status: 200 },
      )
    }

    if (action === "verify") {
      // Verify the code
      if (!code) {
        return NextResponse.json({ error: "Verification code required" }, { status: 400 })
      }

      const storedData = verificationCodes.get(email)

      if (!storedData) {
        return NextResponse.json({ error: "No verification code found for this email" }, { status: 404 })
      }

      if (storedData.expiresAt < Date.now()) {
        verificationCodes.delete(email)
        return NextResponse.json({ error: "Verification code expired, please request a new one" }, { status: 400 })
      }

      if (storedData.code !== code) {
        return NextResponse.json({ error: "Invalid verification code" }, { status: 400 })
      }

      // Mark user as verified
      const user = await userService.getUserByEmail(email)
      if (user) {
        await userService.updateUser(user.id, { emailVerified: true })
      }

      verificationCodes.delete(email)

      console.log(`[v0] Email verified for ${email}`)

      return NextResponse.json(
        {
          success: true,
          message: "Email verified successfully",
        },
        { status: 200 },
      )
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("[v0] Email verification error:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"

const users: Map<string, any> = new Map()
const verificationCodes: Map<string, { code: string; expiresAt: number }> = new Map()

function generateVerificationCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function POST(request: NextRequest) {
  const { action, email, password, username, eFootballCode } = await request.json()

  if (action === "signup") {
    if (users.has(email)) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    if (!eFootballCode) {
      return NextResponse.json({ error: "eFootball code is required" }, { status: 400 })
    }

    const code = generateVerificationCode()
    verificationCodes.set(email, {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    })

    // In production, send email via SendGrid, Resend, or similar
    console.log(`[v0] Verification code for ${email}: ${code}`)

    const user = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      username,
      password, // In production, hash this with bcrypt
      eFootballCode,
      balance: 0,
      verified: false,
      createdAt: new Date(),
    }

    users.set(email, user)
    return NextResponse.json({
      success: true,
      userId: user.id,
      message: "Verification code sent to email",
    })
  }

  if (action === "login") {
    const user = users.get(email)
    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    if (!user.verified) {
      return NextResponse.json(
        { error: "Email not verified. Please check your email for verification code." },
        { status: 403 },
      )
    }

    return NextResponse.json({ success: true, userId: user.id })
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}

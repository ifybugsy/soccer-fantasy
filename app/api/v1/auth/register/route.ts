import { type NextRequest, NextResponse } from "next/server"
import { userService } from "@/lib/db/services/user.service"
import { transactionService } from "@/lib/db/services/transaction.service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, username, password, eFootballCode, country, dateOfBirth } = body

    const missingFields: string[] = []
    if (!email) missingFields.push("email")
    if (!username) missingFields.push("username")
    if (!password) missingFields.push("password")
    if (!eFootballCode) missingFields.push("eFootballCode")
    if (!country) missingFields.push("country")
    if (!dateOfBirth) missingFields.push("dateOfBirth")

    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 },
      )
    }

    // Check if user already exists
    try {
      const existingUser = await userService.getUserByEmail(email)
      if (existingUser) {
        return NextResponse.json({ success: false, error: "Email already registered" }, { status: 409 })
      }
    } catch (dbError) {
      console.error("[v0] Database error checking existing user:", dbError)
      return NextResponse.json({ success: false, error: "Database error - please try again later" }, { status: 503 })
    }

    // Create user
    try {
      const newUser = await userService.createUser({
        id: Math.random().toString(36).substr(2, 9),
        email,
        username,
        password,
        eFootballCode,
        country,
        dateOfBirth,
        balance: 0,
        verified: false,
        emailVerified: false,
        role: "user",
      })

      // Log registration event
      try {
        await transactionService.createTransaction({
          id: Math.random().toString(36).substr(2, 9),
          userId: newUser.id,
          type: "deposit",
          amount: 0,
          currency: "USD",
          status: "completed",
          description: "Account created",
        })
      } catch (logError) {
        console.error("[v0] Transaction log error:", logError)
        // Don't fail registration if transaction logging fails
      }

      return NextResponse.json(
        {
          success: true,
          userId: newUser.id,
          message: "Registration successful",
        },
        { status: 201 },
      )
    } catch (error) {
      console.error("[v0] User creation error:", error)
      return NextResponse.json(
        { success: false, error: "Registration failed - please try again later" },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return NextResponse.json({ success: false, error: "Registration failed" }, { status: 500 })
  }
}

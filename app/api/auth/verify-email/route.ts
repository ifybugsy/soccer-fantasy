export async function POST(request: Request) {
  const { email, code } = await request.json()

  // Validate inputs
  if (!email || !code) {
    return Response.json({ success: false, error: "Email and code required" }, { status: 400 })
  }

  // In production, verify against database stored codes
  // For now, simulating verification (code stored in memory/session in real app)
  const mockVerificationCodes: Record<string, { code: string; expiresAt: number }> = {}

  const storedData = mockVerificationCodes[email]
  if (!storedData || storedData.expiresAt < Date.now()) {
    return Response.json({ success: false, error: "Code expired or invalid" }, { status: 400 })
  }

  if (storedData.code !== code) {
    return Response.json({ success: false, error: "Invalid verification code" }, { status: 400 })
  }

  // Mark user as verified in database
  delete mockVerificationCodes[email]

  return Response.json({
    success: true,
    message: "Email verified successfully",
  })
}

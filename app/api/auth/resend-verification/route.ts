export async function POST(request: Request) {
  const { email } = await request.json()

  if (!email) {
    return Response.json({ success: false, error: "Email required" }, { status: 400 })
  }

  // Generate 6-digit code
  const code = String(Math.floor(100000 + Math.random() * 900000))

  // In production, send via email service (Resend, SendGrid, etc)
  console.log(`Verification code for ${email}: ${code}`)

  return Response.json({
    success: true,
    message: "Verification code sent",
  })
}

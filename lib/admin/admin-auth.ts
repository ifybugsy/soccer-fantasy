import crypto from "crypto"

interface AdminCredentials {
  username: string
  passwordHash: string
}

export const ADMIN_CREDENTIALS: AdminCredentials = {
  username: "admin",
  passwordHash: hashPassword("admin123"),
}

// Hash password using simple SHA256 for demo (production should use bcrypt)
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

// Verify password against hash
export function verifyPassword(password: string, hash: string): boolean {
  const passwordHash = hashPassword(password)
  return passwordHash === hash
}

// Generate JWT-style token for admin
export function generateAdminToken(): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url")
  const payload = Buffer.from(
    JSON.stringify({
      sub: ADMIN_CREDENTIALS.username,
      userId: ADMIN_CREDENTIALS.username,
      role: "admin",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
    }),
  ).toString("base64url")

  const secret = process.env.JWT_SECRET || "your-secret-key"
  const signature = crypto.createHmac("sha256", secret).update(`${header}.${payload}`).digest("base64url")

  return `${header}.${payload}.${signature}`
}

// Verify admin token format
export function verifyAdminToken(token: string): boolean {
  if (!token) return false
  const parts = token.split(".")
  return parts.length === 3
}

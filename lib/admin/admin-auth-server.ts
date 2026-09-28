import crypto from "crypto"
import { type NextRequest, NextResponse } from "next/server"

export interface AdminPrincipal {
  userId: string
  role: "admin"
}

interface AdminTokenPayload {
  sub?: string
  userId?: string
  role?: string
  iat?: number
  exp?: number
  iss?: string
  aud?: string | string[]
}

export const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || "admin",
  passwordHash: process.env.ADMIN_PASSWORD_HASH || hashPassword("admin123"),
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

function getJwtSecret(): string | null {
  return process.env.JWT_SECRET || null
}

function decodeBase64Url(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8")
}

export function generateAdminToken(): string {
  const secret = getJwtSecret()
  if (!secret) throw new Error("Admin authentication is not configured")

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
  const signature = crypto.createHmac("sha256", secret).update(`${header}.${payload}`).digest("base64url")
  return `${header}.${payload}.${signature}`
}

export function verifyAdminToken(token: string): AdminPrincipal | null {
  try {
    const secret = getJwtSecret()
    if (!secret) return null

    const parts = token.split(".")
    if (parts.length !== 3) return null
    const [encodedHeader, encodedPayload, encodedSignature] = parts
    const header = JSON.parse(decodeBase64Url(encodedHeader)) as { alg?: string; typ?: string }
    const payload = JSON.parse(decodeBase64Url(encodedPayload)) as AdminTokenPayload
    if (header.alg !== "HS256" || header.typ !== "JWT" || !payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
      return null
    }
    if (payload.role !== "admin" || typeof (payload.userId || payload.sub) !== "string") return null

    const expected = crypto.createHmac("sha256", secret).update(`${encodedHeader}.${encodedPayload}`).digest("base64url")
    const actualBytes = Buffer.from(encodedSignature)
    const expectedBytes = Buffer.from(expected)
    if (actualBytes.length !== expectedBytes.length || !crypto.timingSafeEqual(actualBytes, expectedBytes)) return null

    return { userId: payload.userId || payload.sub!, role: "admin" }
  } catch {
    return null
  }
}

export function getAdminToken(request: NextRequest): string | null {
  const authorization = request.headers.get("authorization")
  if (authorization?.startsWith("Bearer ")) return authorization.slice(7).trim() || null
  return request.cookies.get("admin_token")?.value || request.headers.get("x-admin-token")?.trim() || null
}

export function requireAdmin(request: NextRequest): { principal: AdminPrincipal } | { response: NextResponse } {
  const token = getAdminToken(request)
  if (!token) return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }

  const principal = verifyAdminToken(token)
  if (!principal) return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  return { principal }
}

export function isAdminToken(token: string): boolean {
  return verifyAdminToken(token) !== null
}

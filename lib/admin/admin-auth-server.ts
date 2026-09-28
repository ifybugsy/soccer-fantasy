"use server"

import crypto from "crypto"

interface AdminCredentials {
  username: string
  password: string
  token?: string
  expiresAt?: number
}

// Predefined admin credentials
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || "admin",
  passwordHash: process.env.ADMIN_PASSWORD_HASH || hashPassword("admin123"),
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

function generateAdminToken(): string {
  const payload = {
    userId: "admin",
    role: "admin",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
  }

  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64")
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64")
  const signature = crypto
    .createHmac("sha256", process.env.JWT_SECRET || "your-secret-key")
    .update(`${header}.${payloadStr}`)
    .digest("base64")

  return `${header}.${payloadStr}.${signature}`
}

function verifyAdminToken(token: string): boolean {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return false

    const [header, payloadStr, signature] = parts
    const payload = JSON.parse(Buffer.from(payloadStr, "base64").toString())

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return false
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.JWT_SECRET || "your-secret-key")
      .update(`${header}.${payloadStr}`)
      .digest("base64")

    return signature === expectedSignature
  } catch {
    return false
  }
}

export { ADMIN_CREDENTIALS, hashPassword, verifyPassword, generateAdminToken, verifyAdminToken }

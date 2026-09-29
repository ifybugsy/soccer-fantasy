import jwt from "jsonwebtoken"
import type { AuthPayload } from "../types"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d"

export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRE as jwt.SignOptions["expiresIn"],
  })
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload
  } catch (error) {
    console.error("[v0] Token verification failed:", error)
    return null
  }
}

export function decodeToken(token: string): AuthPayload | null {
  try {
    return jwt.decode(token) as AuthPayload
  } catch (error) {
    return null
  }
}

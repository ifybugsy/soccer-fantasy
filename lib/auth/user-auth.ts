import { type NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import { userService } from "@/lib/db/services/user.service"

interface UserTokenPayload extends jwt.JwtPayload {
  userId?: string
}

export class UserAuthError extends Error {
  status: 401 | 500

  constructor(message: string, status: 401 | 500 = 401) {
    super(message)
    this.name = "UserAuthError"
    this.status = status
  }
}

export async function requireAuthenticatedUser(request: NextRequest) {
  const authorization = request.headers.get("authorization")
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7).trim() : null
  const secret = process.env.JWT_SECRET

  if (!token) {
    throw new UserAuthError("Authentication required")
  }

  if (!secret) {
    console.error("[v0] JWT_SECRET is not configured")
    throw new UserAuthError("Authentication unavailable", 500)
  }

  let payload: UserTokenPayload
  try {
    payload = jwt.verify(token, secret) as UserTokenPayload
  } catch {
    throw new UserAuthError("Invalid or expired authentication")
  }

  if (typeof payload.userId !== "string" || !payload.userId) {
    throw new UserAuthError("Invalid authentication")
  }

  const user = await userService.getUserById(payload.userId)
  if (!user) {
    throw new UserAuthError("Authenticated user not found")
  }

  return user
}

export function authErrorResponse(error: unknown) {
  if (error instanceof UserAuthError) {
    return { error: error.message, status: error.status }
  }

  return { error: "Authentication failed", status: 401 }
}

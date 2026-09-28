import type { Request, Response, NextFunction } from "express"
import { verifyToken } from "../config/jwt"

export interface AuthRequest extends Request {
  userId?: string
  userRole?: string
  userEmail?: string
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.split(" ")[1]

  if (!token) {
    res.status(401).json({ error: "Missing authorization token" })
    return
  }

  const payload = verifyToken(token)
  if (!payload) {
    res.status(401).json({ error: "Invalid or expired token" })
    return
  }

  req.userId = payload.userId
  req.userRole = payload.role
  req.userEmail = payload.email
  next()
}

export function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.userRole !== "admin") {
    res.status(403).json({ error: "Admin access required" })
    return
  }
  next()
}

import type { Request, Response, NextFunction } from "express"

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  console.error("[v0] Error:", err.message)

  if (err.message.includes("Invalid")) {
    res.status(400).json({ error: err.message })
    return
  }

  if (err.message.includes("not found")) {
    res.status(404).json({ error: err.message })
    return
  }

  res.status(500).json({ error: "Internal server error" })
}

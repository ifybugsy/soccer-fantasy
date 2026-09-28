import { Router, type Response } from "express"
import { AuthService } from "../services/auth.service"
import { authMiddleware, type AuthRequest } from "../middleware/auth"

const router = Router()
const authService = new AuthService()

router.post("/register", async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, fullName, username } = req.body

    if (!email || !password || !fullName || !username) {
      res.status(400).json({ error: "Missing required fields" })
      return
    }

    const result = await authService.register(email, password, fullName, username)
    console.log("[v0] User registered:", result.user.email)

    res.status(201).json({
      success: true,
      user: result.user,
      token: result.token,
    })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

router.post("/login", async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" })
      return
    }

    const result = await authService.login(email, password)
    console.log("[v0] User logged in:", result.user.email)

    res.status(200).json({
      success: true,
      user: result.user,
      token: result.token,
    })
  } catch (error: any) {
    res.status(401).json({ error: error.message })
  }
})

router.get("/me", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await authService.getUserById(req.userId!)

    if (!user) {
      res.status(404).json({ error: "User not found" })
      return
    }

    res.status(200).json({
      success: true,
      user,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router

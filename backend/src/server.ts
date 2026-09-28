import express, { type Request, type Response } from "express"
import cors from "cors"
import http from "http"
import dotenv from "dotenv"
import { connectDatabase, closeDatabase } from "./config/database"
import { errorHandler } from "./middleware/errorHandler"
import { WebSocketManager } from "./ws/websocket"

// Load environment variables
dotenv.config()

// Initialize Express app
const app = express()
const PORT = process.env.PORT || 5000
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000"

// Middleware
app.use(cors({ origin: CORS_ORIGIN }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request logging
app.use((req: Request, res: Response, next) => {
  console.log(`[v0] ${req.method} ${req.path}`)
  next()
})

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// Import routes
import authRoutes from "./routes/auth.routes"
import paymentRoutes from "./routes/payment.routes"

// Register routes
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/payment", paymentRoutes)

// Error handling
app.use(errorHandler)

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" })
})

// Create HTTP server
const server = http.createServer(app)

// Initialize WebSocket
const wsManager = new WebSocketManager(server)

// Start server
async function startServer() {
  try {
    console.log("[v0] Starting Soccer Fantasy Backend Server...")
    console.log("[v0] Connecting to MongoDB...")

    await connectDatabase()
    console.log("[v0] Database connected successfully")

    // Start listening
    server.listen(PORT, () => {
      console.log(`[v0] ========================================`)
      console.log(`[v0] Backend server running on port ${PORT}`)
      console.log(`[v0] Environment: ${process.env.NODE_ENV || "development"}`)
      console.log(`[v0] CORS Origin: ${CORS_ORIGIN}`)
      console.log(`[v0] WebSocket Manager initialized on port ${process.env.WS_PORT || 8080}`)
      console.log(`[v0] Paystack integration active`)
      console.log(`[v0] Ready to accept requests`)
      console.log(`[v0] ========================================`)
    })
  } catch (error) {
    console.error("[v0] ========================================")
    console.error("[v0] Failed to start server")
    console.error("[v0] Error:", error instanceof Error ? error.message : JSON.stringify(error))
    console.error("[v0] ========================================")
    console.error("")
    console.error("[v0] TROUBLESHOOTING STEPS:")
    console.error("[v0] 1. Create a MongoDB Atlas account at mongodb.com/cloud/atlas (free tier)")
    console.error("[v0] 2. Create a cluster and get your connection string")
    console.error("[v0] 3. Add your IP address to the whitelist in MongoDB Atlas")
    console.error("[v0] 4. Update MONGODB_URI in your .env file")
    console.error("[v0] 5. Run: npm run dev")
    console.error("")
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("[v0] Shutting down gracefully...")
  await closeDatabase()
  server.close(() => {
    console.log("[v0] Server closed")
    process.exit(0)
  })
})

// Start the server
startServer()

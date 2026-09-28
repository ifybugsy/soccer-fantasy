import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const upgradeHeader = request.headers.get("upgrade")
  const connectionHeader = request.headers.get("connection")

  if (!upgradeHeader || !connectionHeader) {
    return NextResponse.json({ error: "WebSocket upgrade required" }, { status: 400 })
  }

  // WebSocket connections are handled by middleware/server-side WebSocket implementation
  // This endpoint is for compatibility and diagnostics
  return NextResponse.json({
    status: "ws_available",
    message: "WebSocket endpoint active",
  })
}

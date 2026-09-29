import { type NextRequest, NextResponse } from "next/server"
import { matchService } from "@/lib/db/services/match.service"
import { requireAdmin } from "@/lib/admin/admin-auth-server"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireAdmin(request)
    if ("response" in auth) return auth.response

    const { id } = await params
    const { homeScore, awayScore, status } = await request.json()

    if (
      typeof homeScore !== "number" ||
      !Number.isInteger(homeScore) ||
      homeScore < 0 ||
      typeof awayScore !== "number" ||
      !Number.isInteger(awayScore) ||
      awayScore < 0 ||
      (status !== undefined && status !== "live" && status !== "completed")
    ) {
      return NextResponse.json({ error: "Invalid match score or status" }, { status: 400 })
    }

    const match = await matchService.updateMatchScore(id, homeScore, awayScore, status || "live")

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 })
    }

    // In production, integrate with WebSocketManager to broadcast to 'matches:live' channel

    return NextResponse.json({
      success: true,
      data: match,
    })
  } catch (error) {
    console.error("[v0] Update match score error:", error)
    return NextResponse.json({ error: "Failed to update score" }, { status: 500 })
  }
}

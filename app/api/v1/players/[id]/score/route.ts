import { type NextRequest, NextResponse } from "next/server"
import { playerService } from "@/lib/db/services/player.service"
import { requireAdmin } from "@/lib/admin/admin-auth-server"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireAdmin(request)
    if ("response" in auth) return auth.response

    const { id } = await params
    const { score } = await request.json()

    if (typeof score !== "number" || !Number.isFinite(score) || score < 0) {
      return NextResponse.json({ error: "Score must be a finite non-negative number" }, { status: 400 })
    }

    const player = await playerService.updatePlayerScore(id, score)

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: player,
    })
  } catch (error) {
    console.error("[v0] Update player score error:", error)
    return NextResponse.json({ error: "Failed to update score" }, { status: 500 })
  }
}

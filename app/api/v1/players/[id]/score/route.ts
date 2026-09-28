import { type NextRequest, NextResponse } from "next/server"
import { playerService } from "@/lib/db/services/player.service"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminToken = request.headers.get("x-admin-token")
    if (!adminToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { score } = await request.json()

    if (score === undefined) {
      return NextResponse.json({ error: "Score required" }, { status: 400 })
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

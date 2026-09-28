import { type NextRequest, NextResponse } from "next/server"
import { playerService } from "@/lib/db/services/player.service"
import { requireAdmin } from "@/lib/admin/admin-auth-server"

export async function GET(request: NextRequest) {
  try {
    const team = request.nextUrl.searchParams.get("team") || undefined
    let players

    if (team) {
      players = await playerService.getPlayersByTeam(team)
    } else {
      const limit = Math.min(Number(request.nextUrl.searchParams.get("limit")) || 100, 500)
      players = await playerService.getAllPlayers(limit)
    }

    return NextResponse.json({
      success: true,
      data: players,
    })
  } catch (error) {
    console.error("[v0] Get players error:", error)
    return NextResponse.json({ error: "Failed to fetch players" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAdmin(request)
    if ("response" in auth) return auth.response

    const { name, team, position, price } = await request.json()

    if (!name || !team || !position || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const player = await playerService.createPlayer({
      id: Math.random().toString(36).substr(2, 9),
      name,
      team,
      position,
      price,
      totalScore: 0,
      matchesPlayed: 0,
    })

    return NextResponse.json({ success: true, data: player }, { status: 201 })
  } catch (error) {
    console.error("[v0] Create player error:", error)
    return NextResponse.json({ error: "Failed to create player" }, { status: 500 })
  }
}

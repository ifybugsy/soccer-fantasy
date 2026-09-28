import { type NextRequest, NextResponse } from "next/server"
import { leagueService } from "@/lib/db/services/league.service"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const league = await leagueService.getLeagueById(id)

    if (!league) {
      return NextResponse.json({ error: "League not found" }, { status: 404 })
    }

    const standings = league.members.sort((a, b) => b.totalScore - a.totalScore)

    return NextResponse.json({
      success: true,
      data: standings,
    })
  } catch (error) {
    console.error("[v0] Get standings error:", error)
    return NextResponse.json({ error: "Failed to fetch standings" }, { status: 500 })
  }
}

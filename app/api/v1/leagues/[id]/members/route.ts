import { type NextRequest, NextResponse } from "next/server"
import { leagueService } from "@/lib/db/services/league.service"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const league = await leagueService.getLeagueById(id)
    if (!league) {
      return NextResponse.json({ error: "League not found" }, { status: 404 })
    }

    const members = league.members.sort((a, b) => a.rank - b.rank)

    return NextResponse.json({
      success: true,
      data: members,
    })
  } catch (error) {
    console.error("[v0] Get members error:", error)
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { matchService } from "@/lib/db/services/match.service"

export async function GET() {
  try {
    const matches = await matchService.getLiveMatches()
    return NextResponse.json({
      success: true,
      data: matches,
      count: matches.length,
    })
  } catch (error) {
    console.error("[v0] Get live matches error:", error)
    return NextResponse.json({ error: "Failed to fetch live matches" }, { status: 500 })
  }
}

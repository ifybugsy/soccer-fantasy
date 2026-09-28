import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const leagueType = searchParams.get("leagueType")
    const leagueId = searchParams.get("leagueId")
    const limit = Number(searchParams.get("limit")) || 20

    const { db } = await connectToDatabase()
    const collection = db.collection("match_results")

    const query: any = { status: "approved" }
    if (leagueType) query.leagueType = leagueType
    if (leagueId) query["leagueUpdates.updatedLeagueIds"] = new ObjectId(leagueId)

    const results = await collection.find(query).sort({ submittedAt: -1 }).limit(limit).toArray()

    // Transform results for frontend
    const transformedResults = results.map((result) => ({
      _id: result._id.toString(),
      username: result.username,
      leagueType: result.leagueType,
      match: `${result.homeTeam.name} ${result.homeTeam.score} - ${result.awayTeam.score} ${result.awayTeam.name}`,
      homeTeam: result.homeTeam,
      awayTeam: result.awayTeam,
      winner: result.matchWinner,
      goalScorers: result.goalScorers,
      screenshotUrl: result.screenshotUrl,
      status: result.status,
      submittedAt: result.submittedAt,
      syncedToLeagues: result.syncedToLeagues,
      updatedLeagueIds: result.leagueUpdates?.updatedLeagueIds || [],
    }))

    return NextResponse.json({
      success: true,
      count: transformedResults.length,
      data: transformedResults,
    })
  } catch (error) {
    console.error("[v0] Stream results error:", error)
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 })
  }
}

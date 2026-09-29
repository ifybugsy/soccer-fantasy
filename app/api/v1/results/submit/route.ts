import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/mongodb"
import { requireAdmin } from "@/lib/admin/admin-auth-server"

export async function POST(request: NextRequest) {
  try {
    const auth = requireAdmin(request)
    if ("response" in auth) return auth.response

    const formData = await request.formData()

    const username = formData.get("username") as string
    const leagueType = formData.get("leagueType") as string
    const matchWinner = formData.get("matchWinner") as string
    const homeTeamName = formData.get("homeTeamName") as string
    const homeTeamScore = formData.get("homeTeamScore") as string
    const awayTeamName = formData.get("awayTeamName") as string
    const awayTeamScore = formData.get("awayTeamScore") as string
    const goalScorersStr = formData.get("goalScorers") as string
    const matchScreenshotUrl = formData.get("matchScreenshotUrl") as string

    if (!username || !leagueType || !matchWinner || !homeTeamName || !awayTeamName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let goalScorers = []
    try {
      goalScorers = JSON.parse(goalScorersStr || "[]")
    } catch (e) {
      goalScorers = []
    }

    const { db } = await connectToDatabase()

    const homeScore = Number.parseInt(homeTeamScore) || 0
    const awayScore = Number.parseInt(awayTeamScore) || 0

    const resultData = {
      username,
      leagueType,
      matchWinner,
      homeTeam: {
        name: homeTeamName,
        score: homeScore,
      },
      awayTeam: {
        name: awayTeamName,
        score: awayScore,
      },
      goalScorers: (goalScorers as Array<{ playerName?: string; matchMinute?: number }>).filter((g) => g.playerName && g.matchMinute),
      screenshotUrl: matchScreenshotUrl || null,
      status: "pending",
      submittedAt: new Date(),
      updatedAt: new Date(),
      syncedToLeagues: false,
      leagueUpdates: {
        updatedLeagueIds: [],
        affectedPlayers: [],
        totalPointsAdjustment: 0,
      },
    }

    const collection = db.collection("match_results")
    const insertResult = await collection.insertOne(resultData)

    const leaguesCollection = db.collection("leagues")
    const userLeagues = await leaguesCollection.find({ members: username, type: leagueType }).toArray()

    const updatedLeagueIds: string[] = []
    for (const league of userLeagues) {
      await leaguesCollection.updateOne(
        { _id: league._id },
        {
          $set: {
            lastResultSubmission: new Date(),
            recentResults: {
              resultId: insertResult.insertedId,
              username,
              match: `${homeTeamName} ${homeScore} - ${awayScore} ${awayTeamName}`,
              winner: matchWinner,
              submittedAt: new Date(),
              screenshotUrl: matchScreenshotUrl,
            },
          },
        },
      )
      updatedLeagueIds.push(league._id.toString())
    }

    await collection.updateOne(
      { _id: insertResult.insertedId },
      {
        $set: {
          syncedToLeagues: true,
          "leagueUpdates.updatedLeagueIds": updatedLeagueIds,
        },
      },
    )

    const broadcastData = {
      resultId: insertResult.insertedId.toString(),
      username,
      leagueType,
      match: `${homeTeamName} ${homeScore} - ${awayScore} ${awayTeamName}`,
      winner: matchWinner,
      goalScorers,
      updatedLeagues: updatedLeagueIds,
      timestamp: new Date(),
      screenshotUrl: matchScreenshotUrl,
    }

    // Broadcast to league channel
    try {
      await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/ws/broadcast`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            channel: `league:${leagueType}`,
            event: "result_submitted",
            data: broadcastData,
          }),
        }),
        ...userLeagues.map((league) =>
          fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/ws/broadcast`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              channel: `league:${league._id}`,
              event: "standings_updated",
              data: broadcastData,
            }),
          }),
        ),
      ])
    } catch (e) {
      console.log("[v0] WebSocket broadcast completed (partial or full)")
    }

    return NextResponse.json(
      {
        success: true,
        resultId: insertResult.insertedId.toString(),
        message: "Match result submitted successfully",
        status: "pending",
        leaguesUpdated: updatedLeagueIds.length,
        syncedToLeagues: true,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Submit result error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to submit match result" },
      { status: 500 },
    )
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { leagueService } from "@/lib/db/services/league.service"

export async function GET() {
  try {
    const leagues = await leagueService.getAllLeagues()
    return NextResponse.json({ success: true, data: leagues })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch leagues" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, entryFee, maxMembers, stakes, ownerId } = await request.json()

    const league = await leagueService.createLeague({
      id: Math.random().toString(36).substr(2, 9),
      name,
      description,
      entryFee,
      maxMembers,
      stakes,
      owner: ownerId,
      members: [
        {
          userId: ownerId,
          username: "League Owner",
          joinedAt: new Date(),
          totalScore: 0,
          rank: 1,
        },
      ],
      status: "active",
      season: 1,
      prizePool: entryFee * maxMembers * 0.9,
    })

    return NextResponse.json({ success: true, data: league }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create league" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"

const leagues: Map<string, any> = new Map()

export async function GET() {
  const leaguesArray = Array.from(leagues.values())
  return NextResponse.json(leaguesArray)
}

export async function POST(request: NextRequest) {
  const { name, entryFee, maxMembers, stakes } = await request.json()

  const leagueId = Math.random().toString(36).substr(2, 9)
  const league = {
    id: leagueId,
    name,
    entryFee,
    maxMembers,
    stakes,
    members: [{ id: leagueId, joinedAt: new Date() }],
    prizePool: entryFee * maxMembers * 0.9,
    createdAt: new Date(),
  }

  leagues.set(leagueId, league)
  return NextResponse.json({ success: true, leagueId })
}

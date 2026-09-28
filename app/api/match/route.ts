import { type NextRequest, NextResponse } from "next/server"

// Simulated player pool
const playerPool: Map<string, any> = new Map()

export async function POST(request: NextRequest) {
  const { action, userId, leagueId, skillRating } = await request.json()

  if (action === "findMatch") {
    // Simulate finding a match by skill rating
    const matchedPlayer = {
      id: Math.random().toString(36).substr(2, 9),
      username: `Player${Math.floor(Math.random() * 10000)}`,
      skillRating: skillRating + Math.floor(Math.random() * 100 - 50),
      winRate: Math.floor(Math.random() * 30 + 50),
      level: ["Silver", "Gold", "Elite", "Legendary"][Math.floor(Math.random() * 4)],
    }

    return NextResponse.json({ success: true, opponent: matchedPlayer })
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}

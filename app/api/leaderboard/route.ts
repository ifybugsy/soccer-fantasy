import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type") || "global"

  // Simulated leaderboard data
  const leaderboardData = {
    global: [
      { rank: 1, username: "ProPlayer88", points: 8950, level: "Legendary" },
      { rank: 2, username: "FootballKing", points: 8720, level: "Legendary" },
      { rank: 3, username: "SoccerMaster", points: 8580, level: "Elite" },
    ],
    country: [
      { rank: 1, username: "NairoPlayer", country: "Nigeria", points: 7850 },
      { rank: 2, username: "LagosFan", country: "Nigeria", points: 7620 },
    ],
  }

  return NextResponse.json(leaderboardData[type as keyof typeof leaderboardData] || [])
}

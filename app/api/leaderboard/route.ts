import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/mongodb"
import type { Player, User } from "@/lib/db/schemas"

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type") || "global"
  const { db } = await connectToDatabase()

  const players = await db
    .collection<Player>("players")
    .find({}, { projection: { id: 1, name: 1, totalScore: 1, matchesPlayed: 1 } })
    .sort({ totalScore: -1, id: 1 })
    .limit(100)
    .toArray()

  if (type === "country") {
    const users = await db
      .collection<User>("users")
      .find({}, { projection: { username: 1, country: 1 } })
      .toArray()
    const countriesByUsername = new Map(users.map((user) => [user.username, user.country || "Unknown"]))

    return NextResponse.json(
      players.map((player, index) => ({
        id: player.id,
        rank: index + 1,
        username: player.name,
        points: player.totalScore,
        gamesPlayed: player.matchesPlayed,
        winRate: 0,
        country: countriesByUsername.get(player.name) || "Unknown",
      })),
    )
  }

  return NextResponse.json(
    players.map((player, index) => ({
      id: player.id,
      rank: index + 1,
      username: player.name,
      points: player.totalScore,
      gamesPlayed: player.matchesPlayed,
      winRate: 0,
      level: player.totalScore >= 5000 ? "Legendary" : player.totalScore >= 2500 ? "Elite" : "Silver",
    })),
  )
}

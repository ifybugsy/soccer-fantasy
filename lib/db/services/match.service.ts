import { connectToDatabase } from "../mongodb"
import type { Match } from "../schemas"

export const matchService = {
  async createMatch(match: Omit<Match, "_id" | "createdAt" | "updatedAt">) {
    const { db } = await connectToDatabase()

    const newMatch = {
      ...match,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("matches").insertOne(newMatch as any)
    return { ...newMatch, _id: result.insertedId }
  },

  async getMatchById(id: string): Promise<Match | null> {
    const { db } = await connectToDatabase()
    return db.collection("matches").findOne({ id })
  },

  async getLiveMatches(): Promise<Match[]> {
    const { db } = await connectToDatabase()
    return db.collection("matches").find({ status: "live" }).toArray()
  },

  async updateMatchScore(
    matchId: string,
    homeScore: number,
    awayScore: number,
    status: "live" | "completed",
  ): Promise<Match | null> {
    const { db } = await connectToDatabase()

    const result = await db.collection("matches").findOneAndUpdate(
      { id: matchId },
      {
        $set: {
          homeScore,
          awayScore,
          status,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    )

    return result.value
  },

  async getLeagueMatches(leagueId: string): Promise<Match[]> {
    const { db } = await connectToDatabase()
    return db.collection("matches").find({ leagueId }).toArray()
  },
}

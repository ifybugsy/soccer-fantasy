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

    const result = await db.collection<import("../schemas").Match>("matches").insertOne(newMatch as any)
    return { ...newMatch, _id: result.insertedId }
  },

  async getMatchById(id: string): Promise<Match | null> {
    const { db } = await connectToDatabase()
    return db.collection<import("../schemas").Match>("matches").findOne({ id })
  },

  async getLiveMatches(): Promise<Match[]> {
    const { db } = await connectToDatabase()
    return db.collection<import("../schemas").Match>("matches").find({ status: "live" }).toArray()
  },

  async updateMatchScore(
    matchId: string,
    homeScore: number,
    awayScore: number,
    status: "live" | "completed",
  ): Promise<Match | null> {
    const { db } = await connectToDatabase()

    const result = await db.collection<import("../schemas").Match>("matches").findOneAndUpdate(
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

    return result
  },

  async getLeagueMatches(leagueId: string): Promise<Match[]> {
    const { db } = await connectToDatabase()
    return db.collection<import("../schemas").Match>("matches").find({ leagueId }).toArray()
  },
}

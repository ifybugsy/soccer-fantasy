import { connectToDatabase } from "../mongodb"
import type { League, LeagueMember } from "../schemas"

export const leagueService = {
  async createLeague(league: Omit<League, "_id" | "createdAt" | "updatedAt" | "currentMembers">) {
    const { db } = await connectToDatabase()

    const newLeague = {
      ...league,
      currentMembers: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("leagues").insertOne(newLeague as any)
    return { ...newLeague, _id: result.insertedId }
  },

  async getLeagueById(id: string): Promise<League | null> {
    const { db } = await connectToDatabase()
    return db.collection("leagues").findOne({ id })
  },

  async getAllLeagues(limit = 50): Promise<League[]> {
    const { db } = await connectToDatabase()
    return db.collection("leagues").find({ status: "active" }).limit(limit).toArray()
  },

  async addMemberToLeague(leagueId: string, member: LeagueMember): Promise<boolean> {
    const { db } = await connectToDatabase()

    const result = await db.collection("leagues").findOneAndUpdate(
      { id: leagueId, currentMembers: { $lt: 30 } }, // Assuming max 30 members
      {
        $push: { members: member },
        $inc: { currentMembers: 1 },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: "after" },
    )

    return !!result.value
  },

  async updateLeagueStandings(leagueId: string, standings: LeagueMember[]): Promise<void> {
    const { db } = await connectToDatabase()
    await db.collection("leagues").updateOne(
      { id: leagueId },
      {
        $set: {
          members: standings,
          updatedAt: new Date(),
        },
      },
    )
  },
}

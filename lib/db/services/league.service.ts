import { connectToDatabase } from "../mongodb"
import type { League, LeagueMember } from "../schemas"
import type { ClientSession } from "mongodb"
import type { Collection } from "mongodb"

export const leagueService = {
  async createLeague(league: Omit<League, "_id" | "createdAt" | "updatedAt" | "currentMembers">) {
    const { db } = await connectToDatabase()

    const newLeague = {
      ...league,
      currentMembers: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection<League>("leagues").insertOne(newLeague as any)
    return { ...newLeague, _id: result.insertedId }
  },

  async getLeagueById(id: string): Promise<League | null> {
    const { db } = await connectToDatabase()
    return db.collection<League>("leagues").findOne({ id })
  },

  async getAllLeagues(limit = 50): Promise<League[]> {
    const { db } = await connectToDatabase()
    return db.collection<League>("leagues").find({ status: "active" }).limit(limit).toArray()
  },

  async addMemberToLeague(leagueId: string, member: LeagueMember): Promise<boolean> {
    const { db } = await connectToDatabase()

    const result = await db.collection<League>("leagues").findOneAndUpdate(
      { id: leagueId, currentMembers: { $lt: 30 } }, // Assuming max 30 members
      {
        $push: { members: member },
        $inc: { currentMembers: 1 },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: "after" },
    )

    return !!result
  },

  async joinLeague(
    leagueId: string,
    member: LeagueMember,
    entryFee: number,
    maxMembers: number,
    userId: string,
    transactionId: string,
  ) {
    if (!Number.isFinite(entryFee) || entryFee <= 0) return false

    const { client, db } = await connectToDatabase()
    const session = client.startSession()
    try {
      await session.withTransaction(async () => {
        const balanceResult = await db.collection<import("../schemas").User>("users").findOneAndUpdate(
          { id: userId, balance: { $gte: entryFee } },
          { $inc: { balance: -entryFee }, $set: { updatedAt: new Date() } },
          { session },
        )
        if (!balanceResult) throw new Error("INSUFFICIENT_BALANCE")

        const membershipResult = await db.collection<League>("leagues").findOneAndUpdate(
          { id: leagueId, currentMembers: { $lt: maxMembers }, "members.userId": { $ne: userId } },
          { $push: { members: member }, $inc: { currentMembers: 1 }, $set: { updatedAt: new Date() } },
          { session },
        )
        if (!membershipResult) throw new Error("LEAGUE_JOIN_FAILED")

        await db.collection<import("../schemas").Transaction>("transactions").insertOne(
          {
            id: transactionId,
            userId,
            type: "league_entry",
            amount: entryFee,
            currency: "NGN",
            status: "completed",
            description: `Entry fee for league ${leagueId}`,
            createdAt: new Date(),
          },
          { session },
        )
      })
      return true
    } finally {
      await session.endSession()
    }
  },

  async updateLeagueStandings(leagueId: string, standings: LeagueMember[]): Promise<void> {
    const { db } = await connectToDatabase()
    await db.collection<League>("leagues").updateOne(
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

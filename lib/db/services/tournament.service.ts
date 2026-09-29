import { randomUUID } from "node:crypto"
import { connectToDatabase } from "../mongodb"
import type { Tournament, TournamentEntry, User } from "../schemas"

export const tournamentService = {
  async listActive(): Promise<(Tournament & { participantCount: number; prizePool: number })[]> {
    const { db } = await connectToDatabase()
    const now = new Date()
    const tournaments = await db.collection<Tournament>("tournaments").find({
      status: { $in: ["UPCOMING", "REGISTRATION_OPEN", "ACTIVE"] },
      endAt: { $gt: now },
    }).sort({ startAt: 1 }).toArray()

    return Promise.all(tournaments.map(async (tournament) => {
      const participantCount = await db.collection<TournamentEntry>("tournament_entries").countDocuments({
        tournamentId: tournament.id,
        status: "active",
      })
      const grossPool = participantCount * tournament.entryFee
      const platformFee = tournament.payoutConfig
        .filter((payout) => payout.type === "fixed" && payout.rank === 0)
        .reduce((sum, payout) => sum + payout.value, 0)
      return { ...tournament, participantCount, prizePool: Math.max(0, grossPool - platformFee) }
    }))
  },

  async join(tournamentId: string, user: User, idempotencyKey: string) {
    const { client, db } = await connectToDatabase()
    const session = client.startSession()
    try {
      let entry: TournamentEntry | null = null
      await session.withTransaction(async () => {
        const tournament = await db.collection<Tournament>("tournaments").findOne({ id: tournamentId }, { session })
        if (!tournament || !["REGISTRATION_OPEN", "ACTIVE"].includes(tournament.status) || tournament.registrationCloseAt <= new Date()) throw new Error("REGISTRATION_CLOSED")
        const existingTransaction = await db.collection("transactions").findOne({ userId: user.id, externalId: `tournament:${tournamentId}:${idempotencyKey}` }, { session })
        if (existingTransaction) {
          entry = await db.collection<TournamentEntry>("tournament_entries").findOne({ transactionId: existingTransaction.id }, { session })
          return
        }
        const existingEntry = await db.collection<TournamentEntry>("tournament_entries").findOne({ tournamentId, userId: user.id, status: "active" }, { session })
        if (existingEntry) throw new Error("ALREADY_JOINED")
        const count = await db.collection<TournamentEntry>("tournament_entries").countDocuments({ tournamentId, status: "active" }, { session })
        if (tournament.maxParticipants && count >= tournament.maxParticipants) throw new Error("CUP_FULL")
        const updatedUser = await db.collection<User>("users").findOneAndUpdate({ id: user.id, balance: { $gte: tournament.entryFee } }, { $inc: { balance: -tournament.entryFee }, $set: { updatedAt: new Date() } }, { session, returnDocument: "after" })
        if (!updatedUser) throw new Error("INSUFFICIENT_BALANCE")
        const transactionId = randomUUID()
        entry = { id: randomUUID(), tournamentId, userId: user.id, pesId: user.eFootballCode, status: "active", joinedAt: new Date(), transactionId }
        await db.collection<TournamentEntry>("tournament_entries").insertOne(entry, { session })
        await db.collection("transactions").insertOne({ id: transactionId, userId: user.id, type: "league_entry", amount: tournament.entryFee, currency: "NGN", status: "completed", description: `Entry fee for ${tournament.name}`, externalId: `tournament:${tournamentId}:${idempotencyKey}`, createdAt: new Date() }, { session })
      })
      return entry
    } finally {
      await session.endSession()
    }
  },
}

export function tournamentErrorStatus(message: string) {
  return { REGISTRATION_CLOSED: 409, ALREADY_JOINED: 409, CUP_FULL: 409, INSUFFICIENT_BALANCE: 400 }[message] ?? 500
}

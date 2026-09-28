import { connectToDatabase } from "../mongodb"
import type { Player } from "../schemas"

export const playerService = {
  async createPlayer(player: Omit<Player, "_id" | "createdAt" | "updatedAt">) {
    const { db } = await connectToDatabase()

    const newPlayer = {
      ...player,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("players").insertOne(newPlayer as any)
    return { ...newPlayer, _id: result.insertedId }
  },

  async getPlayerById(id: string): Promise<Player | null> {
    const { db } = await connectToDatabase()
    return db.collection("players").findOne({ id })
  },

  async getPlayersByTeam(team: string): Promise<Player[]> {
    const { db } = await connectToDatabase()
    return db.collection("players").find({ team }).toArray()
  },

  async getAllPlayers(limit = 100): Promise<Player[]> {
    const { db } = await connectToDatabase()
    return db.collection("players").find({}).limit(limit).toArray()
  },

  async updatePlayerPrice(id: string, newPrice: number): Promise<Player | null> {
    const { db } = await connectToDatabase()

    const result = await db
      .collection("players")
      .findOneAndUpdate({ id }, { $set: { price: newPrice, updatedAt: new Date() } }, { returnDocument: "after" })

    return result.value
  },

  async updatePlayerScore(id: string, score: number): Promise<Player | null> {
    const { db } = await connectToDatabase()

    const result = await db.collection("players").findOneAndUpdate(
      { id },
      {
        $set: { totalScore: score, updatedAt: new Date() },
        $inc: { matchesPlayed: 1 },
      },
      { returnDocument: "after" },
    )

    return result.value
  },

  async bulkUpdatePlayers(updates: Array<{ id: string; score: number }>) {
    const { db } = await connectToDatabase()

    const operations = updates.map((update) => ({
      updateOne: {
        filter: { id: update.id },
        update: {
          $set: { totalScore: update.score, updatedAt: new Date() },
          $inc: { matchesPlayed: 1 },
        },
      },
    }))

    return db.collection("players").bulkWrite(operations)
  },
}

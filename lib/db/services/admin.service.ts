import { connectToDatabase } from "../mongodb"
import type { User, EventLog } from "../schemas"

export const adminService = {
  async getAllUsers(skip = 0, limit = 50): Promise<User[]> {
    const { db } = await connectToDatabase()
    return db
      .collection("users")
      .find({}, { projection: { password: 0 } })
      .skip(skip)
      .limit(limit)
      .toArray()
  },

  async getUserCount(): Promise<number> {
    const { db } = await connectToDatabase()
    return db.collection("users").countDocuments()
  },

  async updateUserBalance(userId: string, amount: number, reason: string): Promise<User | null> {
    const { db } = await connectToDatabase()

    const result = await db.collection("users").findOneAndUpdate(
      { id: userId },
      {
        $inc: { balance: amount },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: "after" },
    )

    if (result.value) {
      // Log the balance adjustment
      await adminService.logEvent({
        id: Math.random().toString(36).substr(2, 9),
        type: "balance_adjustment",
        userId,
        data: { amount, reason },
        timestamp: new Date(),
      })
    }

    return result.value
  },

  async suspendUser(userId: string): Promise<User | null> {
    const { db } = await connectToDatabase()

    return db
      .collection("users")
      .findOneAndUpdate(
        { id: userId },
        { $set: { verified: false, updatedAt: new Date() } },
        { returnDocument: "after" },
      )
      .then((r) => r.value)
  },

  async unsuspendUser(userId: string): Promise<User | null> {
    const { db } = await connectToDatabase()

    return db
      .collection("users")
      .findOneAndUpdate(
        { id: userId },
        { $set: { verified: true, updatedAt: new Date() } },
        { returnDocument: "after" },
      )
      .then((r) => r.value)
  },

  async logEvent(event: Omit<EventLog, "_id">): Promise<void> {
    const { db } = await connectToDatabase()
    await db.collection("event_logs").insertOne(event as any)
  },

  async getEventLogs(userId?: string, limit = 100): Promise<EventLog[]> {
    const { db } = await connectToDatabase()
    const query = userId ? { userId } : {}
    return db.collection("event_logs").find(query).sort({ timestamp: -1 }).limit(limit).toArray()
  },

  async getAnalytics() {
    const { db } = await connectToDatabase()

    const totalUsers = await db.collection("users").countDocuments()
    const totalLeagues = await db.collection("leagues").countDocuments()
    const totalTransactions = await db.collection("transactions").countDocuments()
    const completedTransactions = await db.collection("transactions").countDocuments({ status: "completed" })

    const revenueAgg = await db
      .collection("transactions")
      .aggregate([
        { $match: { type: "deposit", status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ])
      .toArray()

    const totalRevenue = revenueAgg[0]?.total || 0

    return {
      totalUsers,
      totalLeagues,
      totalTransactions,
      completedTransactions,
      totalRevenue,
      timestamp: new Date(),
    }
  },
}

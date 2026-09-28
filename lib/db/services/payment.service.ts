import { connectToDatabase } from "../mongodb"
import type { Transaction } from "../schemas"

export const paymentService = {
  async processPaymentWebhook(webhookData: any) {
    const { db } = await connectToDatabase()

    const { transactionId, status, amount, externalId } = webhookData

    const result = await db.collection("transactions").findOneAndUpdate(
      { id: transactionId },
      {
        $set: {
          status,
          externalId,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    )

    return result.value
  },

  async getTransactionHistory(userId: string, type?: string, limit = 50): Promise<Transaction[]> {
    const { db } = await connectToDatabase()

    const query: any = { userId }
    if (type) {
      query.type = type
    }

    return db.collection("transactions").find(query).sort({ createdAt: -1 }).limit(limit).toArray()
  },

  async getRevenueStats(startDate: Date, endDate: Date) {
    const { db } = await connectToDatabase()

    const stats = await db
      .collection("transactions")
      .aggregate([
        {
          $match: {
            type: "deposit",
            status: "completed",
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            totalAmount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray()

    return stats
  },

  async getPendingPayouts() {
    const { db } = await connectToDatabase()

    return db
      .collection("transactions")
      .find({ type: "withdrawal", status: "pending" })
      .sort({ createdAt: 1 })
      .toArray()
  },

  async markPayoutAsProcessed(transactionId: string) {
    const { db } = await connectToDatabase()

    const result = await db.collection("transactions").findOneAndUpdate(
      { id: transactionId },
      {
        $set: { status: "completed", processedAt: new Date() },
      },
      { returnDocument: "after" },
    )

    return result.value
  },
}

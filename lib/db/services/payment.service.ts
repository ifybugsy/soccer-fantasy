import { connectToDatabase } from "../mongodb"
import type { Transaction } from "../schemas"

export const paymentService = {
  async completePaystackDeposit({
    reference,
    amountMinor,
    currency,
    transactionId,
  }: {
    reference: string
    amountMinor: number
    currency: string
    transactionId?: string
  }) {
    const { client, db } = await connectToDatabase()
    const session = client.startSession()

    try {
      let completed = false
      let result: Transaction | null = null

      await session.withTransaction(async () => {
        const transaction = await db.collection("transactions").findOne(
          { providerReference: reference, type: "deposit" },
          { session },
        )

        if (!transaction || (transactionId && transaction.id !== transactionId)) {
          throw new Error("PAYMENT_NOT_FOUND")
        }

        const expectedMinor = Math.round(Number(transaction.amount) * 100)
        if (transaction.currency !== currency || expectedMinor !== amountMinor) {
          throw new Error("PAYMENT_DETAILS_MISMATCH")
        }

        if (transaction.status === "completed") {
          result = transaction as unknown as Transaction
          return
        }

        if (transaction.status !== "pending") {
          throw new Error("PAYMENT_NOT_PROCESSABLE")
        }

        const claimed = await db.collection("transactions").findOneAndUpdate(
          { _id: transaction._id, status: "pending" },
          { $set: { status: "completed", updatedAt: new Date(), completedAt: new Date() } },
          { returnDocument: "after", session },
        )

        if (!claimed) {
          result = (await db.collection("transactions").findOne({ _id: transaction._id }, { session })) as unknown as Transaction | null
          return
        }

        await db.collection("users").updateOne(
          { id: transaction.userId },
          { $inc: { balance: Number(transaction.amount) }, $set: { updatedAt: new Date() } },
          { session },
        )
        result = claimed as unknown as Transaction
        completed = true
      })

      return { transaction: result, completed }
    } finally {
      await session.endSession()
    }
  },

  async processPaymentWebhook(webhookData: any) {
    const { db } = await connectToDatabase()
    const { transactionId, status, externalId } = webhookData

    return db.collection("transactions").findOneAndUpdate(
      { id: transactionId },
      { $set: { status, externalId, updatedAt: new Date() } },
      { returnDocument: "after" },
    )
  },

  async getTransactionHistory(userId: string, type?: string, limit = 50): Promise<Transaction[]> {
    const { db } = await connectToDatabase()

    const query: any = { userId }
    if (type) {
      query.type = type
    }

    return (await db.collection("transactions").find(query).sort({ createdAt: -1 }).limit(limit).toArray()) as unknown as Transaction[]
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

    return result
  },
}

import { connectToDatabase } from "../mongodb"
import type { Transaction } from "../schemas"

export const transactionService = {
  async createTransaction(transaction: Omit<Transaction, "_id" | "createdAt">) {
    const { db } = await connectToDatabase()

    const newTransaction = {
      ...transaction,
      createdAt: new Date(),
    }

    const result = await db.collection("transactions").insertOne(newTransaction as any)
    return { ...newTransaction, _id: result.insertedId }
  },

  async getUserTransactions(userId: string, limit = 50): Promise<Transaction[]> {
    const { db } = await connectToDatabase()
    return db.collection("transactions").find({ userId }).sort({ createdAt: -1 }).limit(limit).toArray()
  },

  async getTransactionById(transactionId: string): Promise<Transaction | null> {
    const { db } = await connectToDatabase()
    return db.collection("transactions").findOne({ id: transactionId })
  },

  async updateTransactionStatus(id: string, status: "pending" | "completed" | "failed"): Promise<Transaction | null> {
    const { db } = await connectToDatabase()

    const result = await db
      .collection("transactions")
      .findOneAndUpdate({ id }, { $set: { status } }, { returnDocument: "after" })

    return result.value
  },
}

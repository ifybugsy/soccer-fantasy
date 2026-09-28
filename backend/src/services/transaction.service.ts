import { getDatabase } from "../config/database"
import type { Transaction } from "../types"
import { v4 as uuidv4 } from "uuid"

export class TransactionService {
  async createTransaction(
    userId: string,
    type: string,
    amount: number,
    paymentMethod: string,
    reference: string,
    description: string,
  ): Promise<Transaction> {
    const db = await getDatabase()
    const transactionsCollection = db.collection<Transaction>("transactions")

    const transaction: Transaction = {
      _id: uuidv4(),
      userId,
      type: type as any,
      amount,
      status: "pending",
      paymentMethod,
      reference,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await transactionsCollection.insertOne(transaction)
    return transaction
  }

  async updateTransactionStatus(transactionId: string, status: string): Promise<Transaction | null> {
    const db = await getDatabase()
    const transactionsCollection = db.collection<Transaction>("transactions")

    const result = await transactionsCollection.findOneAndUpdate(
      { _id: transactionId },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    )

    return result.value || null
  }

  async getUserTransactions(userId: string, limit = 50): Promise<Transaction[]> {
    const db = await getDatabase()
    const transactionsCollection = db.collection<Transaction>("transactions")

    return transactionsCollection.find({ userId }).sort({ createdAt: -1 }).limit(limit).toArray()
  }

  async getTransactionById(transactionId: string): Promise<Transaction | null> {
    const db = await getDatabase()
    const transactionsCollection = db.collection<Transaction>("transactions")
    return transactionsCollection.findOne({ _id: transactionId })
  }
}

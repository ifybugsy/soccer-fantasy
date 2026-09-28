import { getDatabase } from "../config/database"
import type { User } from "../types"

export class WalletService {
  async updateBalance(userId: string, amount: number, operation: "add" | "subtract"): Promise<number> {
    const db = await getDatabase()
    const usersCollection = db.collection<User>("users")

    const updateOp =
      operation === "add" ? { $inc: { "wallet.balance": amount } } : { $inc: { "wallet.balance": -amount } }

    const result = await usersCollection.findOneAndUpdate(
      { _id: userId },
      {
        ...updateOp,
        $set: { updatedAt: new Date() },
      },
      { returnDocument: "after" },
    )

    return result.value?.wallet.balance || 0
  }

  async getBalance(userId: string): Promise<number> {
    const db = await getDatabase()
    const usersCollection = db.collection<User>("users")

    const user = await usersCollection.findOne({ _id: userId })
    return user?.wallet.balance || 0
  }

  async hassufficientBalance(userId: string, amount: number): Promise<boolean> {
    const balance = await this.getBalance(userId)
    return balance >= amount
  }
}

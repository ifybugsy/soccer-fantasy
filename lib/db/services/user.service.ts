import { connectToDatabase } from "../mongodb"
import type { User } from "../schemas"
import bcrypt from "bcryptjs"
import type { ClientSession } from "mongodb"
import type { Collection } from "mongodb"

export const userService = {
  async createUser(user: Omit<User, "_id" | "createdAt" | "updatedAt">) {
    const { db } = await connectToDatabase()
    const hashedPassword = await bcrypt.hash(user.password, 10)

    const newUser = {
      ...user,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection<User>("users").insertOne(newUser as any)
    return { ...newUser, _id: result.insertedId }
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const { db } = await connectToDatabase()
    return db.collection<User>("users").findOne({ email })
  },

  async getUserById(id: string): Promise<User | null> {
    const { db } = await connectToDatabase()
    return db.collection<User>("users").findOne({ id })
  },

  async updateUser(id: string, updates: Partial<User>) {
    const { db } = await connectToDatabase()
    const result = await db
      .collection("users")
      .findOneAndUpdate({ id }, { $set: { ...updates, updatedAt: new Date() } }, { returnDocument: "after" })
    return result
  },

  async adjustBalanceIfSufficient(
    id: string,
    amount: number,
    session?: ClientSession,
  ): Promise<User | null> {
    if (!Number.isFinite(amount) || amount <= 0) return null

    const { db } = await connectToDatabase()
    const result = await db.collection<User>("users").findOneAndUpdate(
      { id, balance: { $gte: amount } },
      { $inc: { balance: -amount }, $set: { updatedAt: new Date() } },
      { returnDocument: "after", session },
    )
    return result
  },

  async restoreBalance(id: string, amount: number, session?: ClientSession): Promise<User | null> {
    if (!Number.isFinite(amount) || amount <= 0) return null

    const { db } = await connectToDatabase()
    const result = await db.collection<User>("users").findOneAndUpdate(
      { id },
      { $inc: { balance: amount }, $set: { updatedAt: new Date() } },
      { returnDocument: "after", session },
    )
    return result
  },

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  },
}

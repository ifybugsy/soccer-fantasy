import bcrypt from "bcryptjs"
import { getDatabase } from "../config/database"
import { generateToken, verifyToken } from "../config/jwt"
import type { User, AuthPayload } from "../types"
import { v4 as uuidv4 } from "uuid"

export class AuthService {
  async register(
    email: string,
    password: string,
    fullName: string,
    username: string,
  ): Promise<{ user: User; token: string }> {
    const db = await getDatabase()
    const usersCollection = db.collection<User>("users")

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ $or: [{ email }, { username }] })
    if (existingUser) {
      throw new Error("Email or username already exists")
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user
    const newUser: User = {
      _id: uuidv4(),
      email,
      password: hashedPassword,
      fullName,
      username,
      wallet: {
        balance: 0,
        currency: "NGN",
      },
      profile: {},
      isVerified: false,
      role: "user",
      suspended: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await usersCollection.insertOne(newUser)

    const token = generateToken({
      userId: newUser._id!,
      email: newUser.email,
      role: newUser.role,
    })

    return {
      user: newUser,
      token,
    }
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const db = await getDatabase()
    const usersCollection = db.collection<User>("users")

    const user = await usersCollection.findOne({ email })
    if (!user) {
      throw new Error("Invalid email or password")
    }

    if (user.suspended) {
      throw new Error("Account is suspended")
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw new Error("Invalid email or password")
    }

    const token = generateToken({
      userId: user._id!,
      email: user.email,
      role: user.role,
    })

    return {
      user,
      token,
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    const db = await getDatabase()
    const usersCollection = db.collection<User>("users")
    return usersCollection.findOne({ _id: userId })
  }

  async verifyToken(token: string): Promise<AuthPayload | null> {
    return verifyToken(token)
  }
}

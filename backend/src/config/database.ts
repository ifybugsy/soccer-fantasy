import { MongoClient, type Db } from "mongodb"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectDatabase(): Promise<Db> {
  if (cachedDb) {
    return cachedDb
  }

  const mongoUri = process.env.MONGODB_URI
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not set in .env file. Please configure MongoDB Atlas connection string.")
  }

  if (!mongoUri.startsWith("mongodb://") && !mongoUri.startsWith("mongodb+srv://")) {
    throw new Error(
      `Invalid MongoDB URI format. Must start with "mongodb://" or "mongodb+srv://". Got: ${mongoUri.substring(0, 20)}...`,
    )
  }

  const dbName = process.env.MONGODB_DB || "soccer_fantasy"

  try {
    const client = new MongoClient(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
    })

    console.log("[v0] Attempting to connect to MongoDB...")
    await client.connect()

    cachedClient = client
    cachedDb = client.db(dbName)

    console.log("[v0] Successfully connected to MongoDB")
    console.log(`[v0] Database: ${dbName}`)
    return cachedDb
  } catch (error) {
    console.error("[v0] MongoDB connection failed:", error instanceof Error ? error.message : error)
    throw new Error(
      `Failed to connect to MongoDB. Please ensure: 1) Your MONGODB_URI is correct, 2) MongoDB Atlas cluster is running, 3) IP whitelist allows your connection`,
    )
  }
}

export async function getDatabase(): Promise<Db> {
  if (!cachedDb) {
    return connectDatabase()
  }
  return cachedDb
}

export async function closeDatabase(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close()
    cachedClient = null
    cachedDb = null
    console.log("[v0] Disconnected from MongoDB")
  }
}

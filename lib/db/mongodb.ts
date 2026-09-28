import { MongoClient, type Db } from "mongodb"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null
const MAX_RETRIES = 3
const RETRY_DELAY = 1000

async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    try {
      // Test the connection before returning it
      await cachedClient.db("admin").command({ ping: 1 })
      return { client: cachedClient, db: cachedDb }
    } catch (error) {
      cachedClient = null
      cachedDb = null
    }
  }

  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set")
  }

  const dbName = process.env.MONGODB_DB || "soccer_fantasy"

  let lastError: Error | null = null

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const client = new MongoClient(uri, {
        connectTimeoutMS: 5000,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 5000,
      })

      await client.connect()

      const db = client.db(dbName)

      // Test the connection with a ping
      await db.admin().ping()

      cachedClient = client
      cachedDb = db

      return { client, db }
    } catch (error) {
      lastError = error as Error

      if (attempt < MAX_RETRIES - 1) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * (attempt + 1)))
      }
    }
  }

  // All connection attempts failed
  const errorMsg = `Failed to connect to MongoDB after ${MAX_RETRIES} attempts. Last error: ${lastError?.message}`
  throw new Error(errorMsg)
}

export { connectToDatabase }

import { connectToDatabase } from "@/lib/db/mongodb"

async function initializeDatabase() {
  try {
    console.log("[v0] Connecting to MongoDB...")
    const { db } = await connectToDatabase()

    // Create collections
    const collections = ["users", "leagues", "matches", "players", "rosters", "transactions", "event_logs"]

    for (const collection of collections) {
      try {
        await db.createCollection(collection)
        console.log(`[v0] Created collection: ${collection}`)
      } catch (error: any) {
        if (error.code !== 48) {
          // 48 = namespace already exists
          throw error
        }
        console.log(`[v0] Collection already exists: ${collection}`)
      }
    }

    // Create indexes
    await db.collection("users").createIndex({ email: 1 }, { unique: true })
    await db.collection("users").createIndex({ id: 1 }, { unique: true })

    await db.collection("leagues").createIndex({ id: 1 }, { unique: true })
    await db.collection("leagues").createIndex({ owner: 1 })

    await db.collection("matches").createIndex({ id: 1 }, { unique: true })
    await db.collection("matches").createIndex({ leagueId: 1 })
    await db.collection("matches").createIndex({ status: 1 })

  await db.collection("transactions").createIndex({ userId: 1 })
  await db.collection("transactions").createIndex({ providerReference: 1 }, { unique: true, sparse: true })
  await db.collection("transactions").createIndex({ createdAt: -1 })

    console.log("[v0] Database initialized successfully")
  } catch (error) {
    console.error("[v0] Database initialization error:", error)
    process.exit(1)
  }
}

initializeDatabase()

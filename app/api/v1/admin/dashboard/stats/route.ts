import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/admin/admin-auth"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    if (!verifyAdminToken(token)) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    const { db } = await import("@/lib/db/mongodb").then((m) => m.connectToDatabase())

    // Fetch statistics
    const totalUsers = await db.collection("users").countDocuments()
    const verifiedUsers = await db.collection("users").countDocuments({ emailVerified: true })
    const totalLeagues = await db.collection("leagues").countDocuments()
    const totalTransactions = await db.collection("transactions").countDocuments()

    // Revenue calculation
    const transactions = await db
      .collection("transactions")
      .aggregate([
        { $match: { status: "completed", type: { $in: ["deposit", "league_entry"] } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ])
      .toArray()

    const totalRevenue = transactions[0]?.total || 0

    return NextResponse.json(
      {
        success: true,
        data: {
          totalUsers,
          verifiedUsers,
          verificationRate: totalUsers > 0 ? ((verifiedUsers / totalUsers) * 100).toFixed(2) : 0,
          totalLeagues,
          totalTransactions,
          totalRevenue,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Dashboard stats error:", error)
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 })
  }
}

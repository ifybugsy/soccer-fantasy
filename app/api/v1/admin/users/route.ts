import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/admin/admin-auth"
import { adminService } from "@/lib/db/services/admin.service"

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

    const skip = Number(request.nextUrl.searchParams.get("skip")) || 0
    const limit = Math.min(Number(request.nextUrl.searchParams.get("limit")) || 50, 100)

    const users = await adminService.getAllUsers(skip, limit)
    const totalCount = await adminService.getUserCount()

    return NextResponse.json(
      {
        success: true,
        data: users,
        pagination: {
          skip,
          limit,
          total: totalCount,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Get users error:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    if (!verifyAdminToken(token)) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    const { userId, action, data } = await request.json()

    if (!userId || !action) {
      return NextResponse.json({ error: "userId and action required" }, { status: 400 })
    }

    let result

    if (action === "suspend") {
      result = await adminService.suspendUser(userId)
    } else if (action === "unsuspend") {
      result = await adminService.unsuspendUser(userId)
    } else if (action === "update_balance") {
      if (typeof data?.amount !== "number") {
        return NextResponse.json({ error: "Amount required" }, { status: 400 })
      }
      result = await adminService.updateUserBalance(userId, data.amount, data.reason || "Admin adjustment")
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    if (!result) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log(`[v0] Admin action completed: ${action} on user ${userId}`)

    return NextResponse.json(
      {
        success: true,
        message: `User ${action} successful`,
        data: result,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Update user error:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

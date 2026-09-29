import { type NextRequest, NextResponse } from "next/server"
import { leagueService } from "@/lib/db/services/league.service"
import { authErrorResponse, requireAuthenticatedUser } from "@/lib/auth/user-auth"
import { randomUUID } from "node:crypto"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { username } = await request.json()
    const authenticatedUser = await requireAuthenticatedUser(request)
    const userId = authenticatedUser.id

    if (!username) {
      return NextResponse.json({ error: "User ID and username required" }, { status: 400 })
    }

    const league = await leagueService.getLeagueById(id)
    if (!league) {
      return NextResponse.json({ error: "League not found" }, { status: 404 })
    }

    if (league.currentMembers >= league.maxMembers) {
      return NextResponse.json({ error: "League is full" }, { status: 400 })
    }

    // Check if user already in league
    if (league.members.some((m) => m.userId === userId)) {
      return NextResponse.json({ error: "Already a member of this league" }, { status: 400 })
    }

    if (!Number.isFinite(league.entryFee) || league.entryFee <= 0) {
      return NextResponse.json({ error: "Invalid league entry fee" }, { status: 400 })
    }

    const newMember = {
      userId,
      username,
      joinedAt: new Date(),
      totalScore: 0,
      rank: league.currentMembers + 1,
    }

    try {
      await leagueService.joinLeague(id, newMember, league.entryFee, league.maxMembers, userId, randomUUID())
    } catch (error) {
      if (error instanceof Error && error.message === "INSUFFICIENT_BALANCE") {
        return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
      }
      return NextResponse.json({ error: "Failed to join league" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Successfully joined league",
    })
  } catch (error) {
    const authError = authErrorResponse(error)
    if (error instanceof Error && error.name === "UserAuthError") {
      return NextResponse.json({ error: authError.error }, { status: authError.status })
    }
    console.error("[v0] Join league error:", error)
    return NextResponse.json({ error: "Failed to join league" }, { status: 500 })
  }
}

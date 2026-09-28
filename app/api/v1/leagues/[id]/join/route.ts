import { type NextRequest, NextResponse } from "next/server"
import { leagueService } from "@/lib/db/services/league.service"
import { userService } from "@/lib/db/services/user.service"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { userId, username } = await request.json()

    if (!userId || !username) {
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

    // Deduct entry fee from user balance
    const user = await userService.getUserById(userId)
    if (!user || user.balance < league.entryFee) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    const newMember = {
      userId,
      username,
      joinedAt: new Date(),
      totalScore: 0,
      rank: league.currentMembers + 1,
    }

    const success = await leagueService.addMemberToLeague(id, newMember)

    if (!success) {
      return NextResponse.json({ error: "Failed to join league" }, { status: 400 })
    }

    // Deduct entry fee
    await userService.updateUser(userId, {
      balance: user.balance - league.entryFee,
    })

    return NextResponse.json({
      success: true,
      message: "Successfully joined league",
    })
  } catch (error) {
    console.error("[v0] Join league error:", error)
    return NextResponse.json({ error: "Failed to join league" }, { status: 500 })
  }
}

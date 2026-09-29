import { type NextRequest, NextResponse } from "next/server"
import { requireAuthenticatedUser, authErrorResponse } from "@/lib/auth/user-auth"
import { tournamentService, tournamentErrorStatus } from "@/lib/db/services/tournament.service"

export async function GET() {
  try {
    const cups = await tournamentService.listActive()
    return NextResponse.json({ success: true, data: cups, serverTime: new Date().toISOString() })
  } catch (error) {
    console.error("[v0] Failed to load tournaments", error)
    return NextResponse.json({ success: true, data: [], serverTime: new Date().toISOString() })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser(request)
    const { action, cupId, idempotencyKey } = await request.json()
    if (action !== "joinCup" || typeof cupId !== "string" || !cupId || typeof idempotencyKey !== "string" || !idempotencyKey) {
      return NextResponse.json({ error: "Invalid cup entry request" }, { status: 400 })
    }
    const entry = await tournamentService.join(cupId, user, idempotencyKey)
    return NextResponse.json({ success: true, data: entry }, { status: 201 })
  } catch (error) {
    const auth = authErrorResponse(error)
    if (auth.status !== 401 || error instanceof Error && error.name === "UserAuthError") {
      if (error instanceof Error && ["REGISTRATION_CLOSED", "ALREADY_JOINED", "CUP_FULL", "INSUFFICIENT_BALANCE"].includes(error.message)) {
        return NextResponse.json({ error: error.message }, { status: tournamentErrorStatus(error.message) })
      }
    }
    return NextResponse.json({ error: auth.status === 401 ? auth.error : "Unable to join cup" }, { status: auth.status })
  }
}

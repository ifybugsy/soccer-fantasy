import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const cupType = request.nextUrl.searchParams.get("type")

  const cups = [
    {
      id: 1,
      name: "Daily Cup",
      prize: 5000,
      entryFee: 10,
      duration: "24 hours",
      participants: 234,
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      name: "Weekly Cup",
      prize: 50000,
      entryFee: 50,
      duration: "7 days",
      participants: 1240,
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  return NextResponse.json({ success: true, data: cups })
}

export async function POST(request: NextRequest) {
  const { action, userId, cupId } = await request.json()

  if (action === "joinCup") {
    return NextResponse.json({
      success: true,
      message: "Successfully joined cup",
      cupId,
      entryId: Math.random().toString(36).substr(2, 9),
      participantCountUpdated: true,
    })
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}

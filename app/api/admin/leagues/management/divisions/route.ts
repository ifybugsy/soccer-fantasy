export async function POST(request: Request) {
  const { leagueId, name, tier } = await request.json()

  console.log(`[v0] Division created for league: ${leagueId}`)

  return Response.json({
    success: true,
    message: "Division created successfully",
    division: {
      id: Math.random().toString(36).substr(2, 9),
      name,
      leagueId,
      tier,
      playerCount: 0,
      createdAt: new Date().toISOString(),
    },
  })
}

export async function GET() {
  const mockLeagues = [
    {
      id: "league1",
      name: "Premier League",
      status: "active",
      totalPlayers: 1500,
      divisions: [
        {
          id: "div1",
          name: "Elite Division",
          leagueId: "league1",
          tier: "elite",
          playerCount: 200,
          createdAt: new Date().toISOString(),
        },
        {
          id: "div2",
          name: "Gold Division",
          leagueId: "league1",
          tier: "gold",
          playerCount: 400,
          createdAt: new Date().toISOString(),
        },
        {
          id: "div3",
          name: "Silver Division",
          leagueId: "league1",
          tier: "silver",
          playerCount: 500,
          createdAt: new Date().toISOString(),
        },
        {
          id: "div4",
          name: "Bronze Division",
          leagueId: "league1",
          tier: "bronze",
          playerCount: 400,
          createdAt: new Date().toISOString(),
        },
      ],
    },
    {
      id: "league2",
      name: "Championship",
      status: "active",
      totalPlayers: 800,
      divisions: [
        {
          id: "div5",
          name: "Main Division",
          leagueId: "league2",
          tier: "gold",
          playerCount: 500,
          createdAt: new Date().toISOString(),
        },
        {
          id: "div6",
          name: "Secondary Division",
          leagueId: "league2",
          tier: "silver",
          playerCount: 300,
          createdAt: new Date().toISOString(),
        },
      ],
    },
  ]

  return Response.json({
    leagues: mockLeagues,
  })
}

// Real-time broadcast data for admin monitoring
export async function GET() {
  const mockBroadcasts = [
    {
      id: "broadcast1",
      platform: "YouTube",
      title: "Elite Premier League Live Match",
      streamer: "AdminBroadcaster",
      viewers: 1250,
      status: "live",
      startedAt: new Date(Date.now() - 3600000).toISOString(),
      duration: "60 minutes",
    },
    {
      id: "broadcast2",
      platform: "Facebook",
      title: "Championship Division Highlights",
      streamer: "AdminBroadcaster",
      viewers: 450,
      status: "live",
      startedAt: new Date(Date.now() - 1800000).toISOString(),
      duration: "30 minutes",
    },
    {
      id: "broadcast3",
      platform: "YouTube",
      title: "Rising Stars Tournament",
      streamer: "AdminBroadcaster",
      viewers: 0,
      status: "scheduled",
      startedAt: new Date(Date.now() + 3600000).toISOString(),
      duration: "TBD",
    },
  ]

  return Response.json({
    broadcasts: mockBroadcasts,
    totalViewers: 1700,
  })
}

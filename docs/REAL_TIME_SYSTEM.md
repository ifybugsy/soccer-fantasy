# Real-Time Communication System

## Overview

This document outlines the comprehensive real-time communication system for Soccer Fantasy, enabling seamless data exchange between frontend and backend.

## Architecture

### Components

1. **RealtimeServer** (`lib/realtime/realtime-server.ts`)
   - WebSocket server for real-time connections
   - Channel-based message routing
   - Heartbeat mechanism for connection health
   - Authentication support

2. **RealtimeClient** (`lib/services/realtime-client.ts`)
   - Client-side WebSocket manager
   - Automatic reconnection with exponential backoff
   - Channel subscription/unsubscription
   - Message queuing

3. **useRealtime Hook** (`lib/hooks/use-realtime.ts`)
   - React hook for real-time functionality
   - State management for messages
   - Connection status tracking

## Message Types

### Authentication
\`\`\`json
{
  "type": "auth",
  "token": "jwt_token"
}
\`\`\`

### Subscription
\`\`\`json
{
  "type": "subscribe",
  "channel": "channel_name"
}
\`\`\`

### Broadcast
\`\`\`json
{
  "type": "broadcast",
  "channel": "channel_name",
  "data": { "key": "value" }
}
\`\`\`

### Heartbeat
\`\`\`json
{
  "type": "ping"
}
\`\`\`

## Usage Examples

### Server-Side: Broadcasting Updates
\`\`\`typescript
import { realtimeClient } from "@/lib/services/realtime-client"

// Broadcast leaderboard update to all connected clients
realtimeClient.broadcast("leaderboard", {
  standings: updatedStandings,
  timestamp: new Date()
})
\`\`\`

### Client-Side: Listening for Updates
\`\`\`typescript
import { useRealtime } from "@/lib/hooks/use-realtime"

function LeaderboardComponent() {
  const { connected, messages, subscribe } = useRealtime({
    token: userToken,
    channels: ["leaderboard"]
  })

  useEffect(() => {
    const unsubscribe = subscribe("leaderboard", (message) => {
      console.log("Leaderboard updated:", message.data)
    })
    return unsubscribe
  }, [])

  return <div>Connected: {connected ? "Yes" : "No"}</div>
}
\`\`\`

## Channel Names

- `leaderboard` - Global leaderboard updates
- `league:${leagueId}` - League-specific updates
- `user:${userId}` - User-specific updates
- `admin` - Admin notifications
- `matches` - Live match updates

## Security

1. **Token Verification**: All connections require JWT authentication
2. **Channel Authorization**: Admin-only channels require admin tokens
3. **Rate Limiting**: Message rate limiting per connection
4. **Connection Limits**: Maximum concurrent connections per user

## Reconnection Policy

- Initial delay: 3 seconds
- Backoff multiplier: 2x
- Maximum attempts: 10
- Max total time: ~51 minutes

## Monitoring

Monitor WebSocket connections via:
- `RealtimeServer.getStats()` - Connection statistics
- Server logs with `[v0]` prefix
- Client console logs (development)

## Configuration

Environment variables:
- `NEXT_PUBLIC_WS_URL` - Override WebSocket URL
- `WS_HEARTBEAT_INTERVAL` - Heartbeat frequency (default: 30s)
- `WS_MAX_CONNECTIONS` - Max connections per user (default: 5)

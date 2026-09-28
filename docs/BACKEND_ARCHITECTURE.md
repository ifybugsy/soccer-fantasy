# Soccer Fantasy Web App - Backend Architecture

## Overview
This document outlines the real-time backend architecture for the Soccer Fantasy web application, built with Node.js (Next.js API routes), MongoDB, and WebSocket support.

## Architecture Components

### 1. Database Layer (MongoDB)
- **Connection**: Centralized MongoDB connection with connection pooling
- **Collections**:
  - `users`: User authentication and profile data
  - `leagues`: League configurations and member management
  - `matches`: Match data and live scores
  - `players`: Player information and pricing
  - `rosters`: User team rosters per league
  - `transactions`: Payment and wallet transactions
  - `event_logs`: Event tracking for auditing

### 2. Service Layer
Database access is abstracted through service modules:
- `userService`: User registration, authentication, profile updates
- `leagueService`: League CRUD operations, member management, standings
- `matchService`: Match creation, live score updates, match history
- `transactionService`: Transaction logging and wallet operations

### 3. API Routes (Next.js)
All APIs follow RESTful conventions with versioning:

#### Authentication
- `POST /api/v1/auth/register`: User registration
- `POST /api/v1/auth/login`: User login
- `POST /api/v1/auth/verify-email`: Email verification

#### Leagues
- `GET /api/v1/leagues`: Get all active leagues
- `POST /api/v1/leagues`: Create new league
- `GET /api/v1/leagues/[id]/standings`: Get league standings (real-time)
- `POST /api/v1/leagues/[id]/join`: Join league
- `POST /api/v1/leagues/[id]/leave`: Leave league

#### Matches
- `GET /api/v1/matches/live`: Get live matches (real-time)
- `GET /api/v1/matches/[id]`: Get match details
- `POST /api/v1/matches`: Create match (admin only)
- `PUT /api/v1/matches/[id]/score`: Update live score

#### Wallet & Transactions
- `GET /api/v1/wallet`: Get user balance and transaction history
- `POST /api/v1/wallet`: Create deposit/withdrawal transaction
- `GET /api/v1/wallet/transactions`: Get transaction history

#### Admin
- `GET /api/v1/admin/broadcasts`: Get broadcast management
- `POST /api/v1/admin/broadcasts`: Create broadcast
- `GET /api/v1/admin/users`: Get all users (paginated)
- `POST /api/v1/admin/sync-data`: Sync eFootball data

### 4. Real-time Communication (WebSocket)
Located at `lib/ws/websocket.ts`:

**Channels**:
- `leagues:<leagueId>:standings`: Real-time league standings updates
- `matches:live`: Live match score updates
- `wallet:<userId>`: Wallet balance updates
- `notifications:<userId>`: User notifications

**Message Types**:
\`\`\`json
{
  "type": "subscribe|unsubscribe|broadcast|update",
  "channel": "channel-name",
  "data": {}
}
\`\`\`

**Example Usage (Client)**:
\`\`\`javascript
const ws = new WebSocket('ws://localhost:3000');
ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'subscribe',
    channel: 'leagues:league123:standings'
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Standings updated:', message.data);
};
\`\`\`

### 5. Error Handling
- Consistent HTTP status codes (400, 401, 403, 404, 500)
- Detailed error messages with debug logging
- Try-catch blocks in all route handlers

### 6. Security Considerations
- Password hashing with bcrypt
- Input validation on all endpoints
- User ID verification via headers (should use JWT in production)
- Rate limiting recommended for production
- CORS configuration needed

## Database Schema Details

### Users Collection
\`\`\`typescript
{
  id: string (unique)
  email: string (unique)
  username: string
  password: string (hashed)
  eFootballCode: string
  balance: number
  verified: boolean
  emailVerified: boolean
  role: 'user' | 'admin'
  createdAt: Date
  updatedAt: Date
}
\`\`\`

### Leagues Collection
\`\`\`typescript
{
  id: string (unique)
  name: string
  description: string
  entryFee: number
  maxMembers: number
  currentMembers: number
  stakes: string
  prizePool: number
  owner: string
  members: Array<{
    userId: string
    username: string
    joinedAt: Date
    totalScore: number
    rank: number
  }>
  status: 'active' | 'inactive' | 'completed'
  season: number
  createdAt: Date
  updatedAt: Date
}
\`\`\`

### Matches Collection
\`\`\`typescript
{
  id: string (unique)
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  status: 'scheduled' | 'live' | 'completed'
  startTime: Date
  endTime?: Date
  leagueId: string
  createdAt: Date
  updatedAt: Date
}
\`\`\`

### Transactions Collection
\`\`\`typescript
{
  id: string (unique)
  userId: string
  type: 'deposit' | 'withdrawal' | 'league_entry' | 'prize'
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed'
  description: string
  createdAt: Date
}
\`\`\`

## Real-time Data Flow

1. **Match Score Update**:
   - Admin updates score via `PUT /api/v1/matches/[id]/score`
   - Service updates database
   - WebSocket broadcasts to `matches:live` channel
   - All connected clients receive update

2. **League Standings Update**:
   - User scores are calculated (typically after matches end)
   - `leagueService.updateLeagueStandings()` is called
   - WebSocket broadcasts to `leagues:<leagueId>:standings`
   - Connected clients update UI in real-time

3. **Wallet Transaction**:
   - User initiates deposit/withdrawal via `POST /api/v1/wallet`
   - Transaction created with 'pending' status
   - Payment processor updates status to 'completed'
   - WebSocket broadcasts to `wallet:<userId>`
   - Client receives balance update

## Deployment Considerations

1. **Environment Variables**:
   \`\`\`
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net
   MONGODB_DB=soccer-fantasy
   \`\`\`

2. **WebSocket Support**: 
   - Vercel doesn't support WebSockets natively
   - Alternative: Use Vercel KV (Redis) with polling for real-time updates
   - Or deploy to a platform supporting WebSockets (Railway, Heroku, Digital Ocean)

3. **Scaling**:
   - Use MongoDB Atlas for managed database
   - Implement Redis caching for frequently accessed data
   - Add message queue (Bull, RabbitMQ) for async operations
   - Use CDN for static assets

## API Rate Limiting (Recommended)
\`\`\`typescript
// Example using rate-limit middleware
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
\`\`\`

## Testing
Recommended tools:
- Postman: API testing
- WebSocket Mock Client: WebSocket testing
- Jest: Unit tests for services
- Artillery: Load testing for real-time features

## Future Enhancements
- JWT token authentication
- OAuth2 integration
- GraphQL API for complex queries
- Redis caching layer
- Message queue for async processing
- More granular WebSocket channel permissions
- Automated match data sync with eFootball API

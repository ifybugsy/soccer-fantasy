# Soccer Fantasy Web App - Complete API Endpoints

## Base URL
- Development: `http://localhost:3000/api/v1`
- Production: `https://yourdomain.com/api/v1`

## Authentication Endpoints

### Register User
\`\`\`
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "player123",
  "password": "securepass123",
  "eFootballCode": "ABC123XYZ"
}

Response: 201
{
  "success": true,
  "userId": "abc123",
  "message": "Registration successful"
}
\`\`\`

### Login
\`\`\`
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepass123"
}

Response: 200
{
  "success": true,
  "userId": "abc123",
  "username": "player123",
  "email": "user@example.com"
}
\`\`\`

### Verify Email
\`\`\`
POST /auth/verify-email
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}

Response: 200
{
  "success": true,
  "message": "Email verified"
}
\`\`\`

## League Endpoints

### Get All Leagues
\`\`\`
GET /leagues

Response: 200
{
  "success": true,
  "data": [
    {
      "id": "league123",
      "name": "Premier League Fantasy",
      "entryFee": 50,
      "maxMembers": 20,
      "currentMembers": 15,
      "prizePool": 900,
      "status": "active",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
\`\`\`

### Create League
\`\`\`
POST /leagues
Content-Type: application/json
X-User-ID: userId

{
  "name": "My Fantasy League",
  "description": "A competitive fantasy soccer league",
  "entryFee": 50,
  "maxMembers": 20,
  "stakes": "Prize pool to winners",
  "ownerId": "userId"
}

Response: 201
{
  "success": true,
  "data": { league object }
}
\`\`\`

### Get League Standings
\`\`\`
GET /leagues/{leagueId}/standings

Response: 200
{
  "success": true,
  "data": [
    {
      "userId": "user123",
      "username": "player1",
      "totalScore": 450,
      "rank": 1,
      "joinedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
\`\`\`

### Join League
\`\`\`
POST /leagues/{leagueId}/join
Content-Type: application/json

{
  "userId": "abc123",
  "username": "player123"
}

Response: 200
{
  "success": true,
  "message": "Successfully joined league"
}
\`\`\`

### Get League Members
\`\`\`
GET /leagues/{leagueId}/members

Response: 200
{
  "success": true,
  "data": [ members array ]
}
\`\`\`

## Match Endpoints

### Get Live Matches
\`\`\`
GET /matches/live

Response: 200
{
  "success": true,
  "data": [
    {
      "id": "match123",
      "homeTeam": "Manchester United",
      "awayTeam": "Liverpool",
      "homeScore": 2,
      "awayScore": 1,
      "status": "live",
      "startTime": "2024-01-20T15:00:00Z"
    }
  ],
  "count": 5
}
\`\`\`

### Get Match Details
\`\`\`
GET /matches/{matchId}

Response: 200
{
  "success": true,
  "data": { match object }
}
\`\`\`

### Update Match Score (Admin)
\`\`\`
PUT /matches/{matchId}/score
Content-Type: application/json
X-Admin-Token: adminToken

{
  "homeScore": 3,
  "awayScore": 2,
  "status": "live"
}

Response: 200
{
  "success": true,
  "data": { updated match object }
}
\`\`\`

## Player Endpoints

### Get All Players
\`\`\`
GET /players?limit=100

Response: 200
{
  "success": true,
  "data": [
    {
      "id": "player123",
      "name": "Cristiano Ronaldo",
      "team": "Al-Nassr",
      "position": "Striker",
      "price": 12.0,
      "totalScore": 450,
      "matchesPlayed": 25
    }
  ]
}
\`\`\`

### Get Players by Team
\`\`\`
GET /players?team=Manchester%20United

Response: 200
{
  "success": true,
  "data": [ players array ]
}
\`\`\`

### Create Player (Admin)
\`\`\`
POST /players
Content-Type: application/json
X-Admin-Token: adminToken

{
  "name": "Player Name",
  "team": "Team Name",
  "position": "Midfielder",
  "price": 8.5
}

Response: 201
{
  "success": true,
  "data": { player object }
}
\`\`\`

### Update Player Score (Admin)
\`\`\`
PUT /players/{playerId}/score
Content-Type: application/json
X-Admin-Token: adminToken

{
  "score": 500
}

Response: 200
{
  "success": true,
  "data": { updated player object }
}
\`\`\`

## Wallet Endpoints

### Get Wallet
\`\`\`
GET /wallet
X-User-ID: userId

Response: 200
{
  "success": true,
  "data": {
    "balance": 1500.50,
    "transactions": [
      {
        "id": "txn123",
        "type": "deposit",
        "amount": 500,
        "status": "completed",
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ]
  }
}
\`\`\`

### Create Deposit
\`\`\`
POST /payment/deposit
Content-Type: application/json

{
  "userId": "abc123",
  "amount": 100,
  "currency": "USD",
  "paymentMethod": "credit_card",
  "stripeToken": "tok_visa"
}

Response: 200
{
  "success": true,
  "transactionId": "TXN123456",
  "status": "completed",
  "newBalance": 1600.50
}
\`\`\`

### Create Withdrawal
\`\`\`
POST /payment/withdraw
Content-Type: application/json

{
  "userId": "abc123",
  "amount": 200,
  "currency": "USD",
  "bankAccount": "****5678"
}

Response: 200
{
  "success": true,
  "transactionId": "TXN123457",
  "status": "pending",
  "message": "Withdrawal request submitted. Processing will complete within 1-2 business days"
}
\`\`\`

### Get Transaction History
\`\`\`
GET /wallet/transactions?type=deposit&limit=50
X-User-ID: userId

Response: 200
{
  "success": true,
  "data": [ transactions array ]
}
\`\`\`

### Verify Payment
\`\`\`
GET /payment/verify?transactionId=TXN123456
X-User-ID: userId

Response: 200
{
  "success": true,
  "data": { transaction object }
}
\`\`\`

## Admin Endpoints

### Get All Users
\`\`\`
GET /admin/users?skip=0&limit=50
X-Admin-Token: adminToken

Response: 200
{
  "success": true,
  "data": [ users array ],
  "pagination": {
    "skip": 0,
    "limit": 50,
    "total": 250
  }
}
\`\`\`

### Update User Balance
\`\`\`
PUT /admin/users/{userId}/balance
X-Admin-Token: adminToken

{
  "amount": 500,
  "reason": "Prize payout for league completion"
}

Response: 200
{
  "success": true,
  "data": { updated user object }
}
\`\`\`

### Suspend/Unsuspend User
\`\`\`
POST /admin/users/{userId}/suspend
X-Admin-Token: adminToken

{
  "action": "suspend"
}

Response: 200
{
  "success": true,
  "data": { updated user object }
}
\`\`\`

### Get Analytics
\`\`\`
GET /admin/analytics
X-Admin-Token: adminToken

Response: 200
{
  "success": true,
  "data": {
    "totalUsers": 1250,
    "totalLeagues": 45,
    "totalTransactions": 5320,
    "completedTransactions": 5100,
    "totalRevenue": 125500,
    "timestamp": "2024-01-20T15:00:00Z"
  }
}
\`\`\`

### Get Event Logs
\`\`\`
GET /admin/event-logs?userId=abc123&limit=100
X-Admin-Token: adminToken

Response: 200
{
  "success": true,
  "data": [ event logs array ]
}
\`\`\`

## WebSocket Real-time Updates

### Connect to WebSocket
\`\`\`javascript
const ws = new WebSocket('ws://localhost:3000/api/v1/ws');

ws.onopen = () => {
  console.log('Connected');
};
\`\`\`

### Subscribe to League Standings
\`\`\`javascript
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'leagues:league123:standings'
}));

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Updated standings:', message.data);
};
\`\`\`

### Subscribe to Live Matches
\`\`\`javascript
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'matches:live'
}));
\`\`\`

### Subscribe to Wallet Updates
\`\`\`javascript
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'wallet:userId'
}));
\`\`\`

## Error Responses

All error responses follow this format:

\`\`\`json
{
  "error": "Description of what went wrong"
}
\`\`\`

Common HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

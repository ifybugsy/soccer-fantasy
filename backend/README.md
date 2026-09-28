# Soccer Fantasy Backend Server

A production-ready Node.js/Express backend server with real-time WebSocket support, MongoDB integration, and Paystack payment processing.

## Features

- **Real-time Authentication**: JWT-based user authentication with WebSocket support
- **Live Transactions**: Real-time transaction processing and status updates
- **Paystack Integration**: Complete payment gateway integration for deposits
- **WebSocket Server**: Real-time wallet updates and transaction notifications
- **MongoDB Database**: Persistent data storage for users, transactions, and wallet data
- **Security**: Password hashing, JWT tokens, and signature verification

## Installation

\`\`\`bash
cd backend
npm install
\`\`\`

## Environment Setup

Create a `.env` file with the following variables:

\`\`\`env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=soccer_fantasy
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
WS_PORT=8080
\`\`\`

## Running the Server

**Development:**
\`\`\`bash
npm run dev
\`\`\`

**Production:**
\`\`\`bash
npm run build
npm start
\`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Payments
- `POST /api/payment/initialize` - Initialize payment
- `POST /api/payment/verify` - Verify payment
- `POST /api/payment/webhook` - Paystack webhook
- `GET /api/payment/transactions` - Get user transactions
- `GET /api/payment/wallet` - Get wallet balance

## WebSocket Events

Connect to WebSocket with token: `ws://localhost:8080?token=JWT_TOKEN`

### Incoming Events
- `subscribe` - Subscribe to channel
- `ping` - Health check

### Outgoing Events
- `connection` - Connection established
- `subscription` - Subscription confirmed
- `transaction` - Transaction update
- `wallet_update` - Wallet balance update
- `pong` - Health check response

## Real-time Flow

1. User registers/logs in → JWT token issued
2. Frontend connects to WebSocket with token
3. User initiates payment → Transaction created (pending)
4. Paystack processes payment
5. Webhook confirms payment → Transaction updated (completed)
6. WebSocket broadcasts wallet update to user in real-time
7. Frontend receives update and reflects new balance

## Security

- Passwords hashed with bcryptjs
- JWT tokens for API authentication
- HMAC-SHA512 signature verification for webhooks
- CORS configured for frontend domain
- Admin middleware for protected routes

## Database Schema

### Users Collection
\`\`\`typescript
{
  _id: string,
  email: string,
  password: string,
  fullName: string,
  username: string,
  wallet: { balance: number, currency: string },
  profile: { avatar?: string, bio?: string },
  isVerified: boolean,
  role: 'user' | 'admin',
  suspended: boolean,
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

### Transactions Collection
\`\`\`typescript
{
  _id: string,
  userId: string,
  type: 'deposit' | 'withdrawal' | 'bet' | 'win' | 'refund',
  amount: number,
  status: 'pending' | 'completed' | 'failed' | 'cancelled',
  paymentMethod: string,
  reference: string,
  description: string,
  metadata?: object,
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

## Deployment

Deploy to services like:
- Vercel
- Railway
- Render
- AWS EC2
- DigitalOcean

Ensure environment variables are set in your hosting platform.

## Support

For issues or questions, check the main documentation or contact support.

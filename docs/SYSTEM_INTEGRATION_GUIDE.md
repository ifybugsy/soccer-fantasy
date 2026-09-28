# Soccer Fantasy Complete System Integration Guide

## System Overview

Your Soccer Fantasy application now features three fully integrated systems:

### 1. Real-Time Communication System
- WebSocket-based bidirectional communication
- Automatic reconnection with exponential backoff
- Channel-based message routing
- Heartbeat mechanism for connection health
- Admin broadcast capabilities

### 2. Email Verification System
- Brevo SMTP integration
- 6-digit code-based verification
- 30-minute code expiration
- Rate limiting and security features
- Comprehensive error handling

### 3. Admin Dashboard
- Secure authentication with JWT tokens
- User management capabilities
- Dashboard statistics and analytics
- Event logging and audit trails
- Role-based access control

## Quick Start

### Starting the Application

1. **Set Environment Variables**
   \`\`\`
   MONGODB_URI=mongodb://your_connection_string
   BREVO_SMTP_HOST=smtp-relay.brevo.com
   BREVO_SMTP_PORT=587
   BREVO_SENDER_EMAIL=noreply@yourdomain.com
   BREVO_SMTP_KEY=your_api_key
   JWT_SECRET=your_jwt_secret
   \`\`\`

2. **Install Dependencies**
   \`\`\`bash
   npm install
   # or
   pnpm install
   \`\`\`

3. **Run Development Server**
   \`\`\`bash
   npm run dev
   # or
   pnpm dev
   \`\`\`

### Accessing Admin Dashboard

1. Navigate to `http://localhost:3000/admin/login`
2. Use default credentials:
   - Username: `admin`
   - Password: `admin123`
3. Change password in production!

## API Endpoints Reference

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/admin-login` - Admin login
- `POST /api/v1/auth/verify-email-brevo` - Email verification
- `POST /api/v1/auth/resend-verification` - Resend code

### Admin Management
- `GET /api/v1/admin/users` - List users (requires auth)
- `PUT /api/v1/admin/users` - Update user (requires auth)
- `GET /api/v1/admin/dashboard/stats` - Get statistics (requires auth)
- `GET /api/v1/admin/event-logs` - View logs (requires auth)
- `POST /api/v1/admin/auth/logout` - Logout (requires auth)
- `POST /api/v1/admin/auth/check` - Verify token (requires auth)

### Real-Time (WebSocket)
- Channel: `subscribe` - Subscribe to channel
- Channel: `unsubscribe` - Unsubscribe from channel
- Channel: `broadcast` - Send message (admin only)
- Channel: `auth` - Authenticate connection
- Channel: `ping` - Heartbeat

## Frontend Integration

### Using the API Client

\`\`\`typescript
import { apiClient } from "@/lib/services/api-client"

// Simple GET request
const response = await apiClient.get("/api/endpoint")

// POST with body
const response = await apiClient.post("/api/endpoint", { data: "value" })

// With authentication
const response = await apiClient.get("/api/endpoint", { 
  requiresAdminAuth: true 
})
\`\`\`

### Using Email Verification

\`\`\`typescript
import { useEmailVerification } from "@/lib/hooks/use-email-verification"

function MyComponent() {
  const { sendVerificationEmail, verifyEmail, resendEmail, timeLeft } = useEmailVerification()

  const handleSend = async () => {
    await sendVerificationEmail("user@example.com")
  }

  const handleVerify = async (code: string) => {
    const success = await verifyEmail("user@example.com", code)
    if (success) {
      // Email verified!
    }
  }

  return (
    <div>
      <p>Time left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}</p>
    </div>
  )
}
\`\`\`

### Using Admin Functions

\`\`\`typescript
import { useAdminAuth } from "@/lib/hooks/use-admin-auth"
import { useAdminDashboard } from "@/lib/hooks/use-admin-dashboard"

function AdminPanel() {
  const { isAuthenticated, login, logout, adminInfo } = useAdminAuth()
  const { users, stats, performUserAction } = useAdminDashboard()

  return (
    <div>
      {isAuthenticated && (
        <>
          <p>Logged in as: {adminInfo?.userId}</p>
          <p>Total users: {stats?.totalUsers}</p>
        </>
      )}
    </div>
  )
}
\`\`\`

### Using Real-Time Communication

\`\`\`typescript
import { realtimeClient } from "@/lib/services/realtime-client"

// In your component
useEffect(() => {
  // Connect to real-time server
  realtimeClient.connect(userToken)

  // Subscribe to channel
  const unsubscribe = realtimeClient.subscribe("leaderboard", (message) => {
    console.log("Leaderboard updated:", message.data)
  })

  return () => {
    unsubscribe()
    realtimeClient.disconnect()
  }
}, [userToken])
\`\`\`

## Data Flow Diagrams

### Registration & Email Verification
\`\`\`
User Registration
    ↓
Create Account (emailVerified: false)
    ↓
Redirect to Verify Page
    ↓
Send Code via Brevo SMTP
    ↓
User Enters Code
    ↓
Verify Code ✓
    ↓
Set emailVerified: true
    ↓
Redirect to Login
\`\`\`

### Admin Authentication
\`\`\`
Admin Login Page
    ↓
POST /api/v1/auth/admin-login
    ↓
Verify Credentials
    ↓
Generate JWT Token
    ↓
Store in localStorage
    ↓
Set Authorization Header
    ↓
Access Admin Dashboard
\`\`\`

### Real-Time Updates
\`\`\`
Database Event
    ↓
API Route Triggers Update
    ↓
realtimeClient.broadcast()
    ↓
WebSocket Message Sent
    ↓
Connected Clients Receive
    ↓
Frontend Updates UI
\`\`\`

## Security Best Practices

### Implemented
- ✅ JWT token authentication for admin
- ✅ Email verification before account activation
- ✅ Password hashing (bcrypt for users)
- ✅ Rate limiting on verification codes
- ✅ HTTP-only secure cookies
- ✅ CORS protection
- ✅ Token expiration (24 hours for admin)
- ✅ Server-side input validation

### To Implement in Production
- 🔐 Change default admin credentials
- 🔐 Update password hashing for admin (SHA-256 → bcrypt)
- 🔐 Enable HTTPS only (secure: true in cookies)
- 🔐 Configure rate limiting on all endpoints
- 🔐 Set up firewall rules for WebSocket
- 🔐 Enable database encryption
- 🔐 Implement audit logging for all admin actions
- 🔐 Set up SSL/TLS certificates

## Troubleshooting

### Email Not Sending
1. Check `BREVO_SMTP_KEY` is correct
2. Verify sender email in Brevo dashboard
3. Check firewall rules for SMTP port 587
4. Review server logs for SMTP errors

### WebSocket Connection Failed
1. Verify WebSocket URL is correct
2. Check browser console for connection errors
3. Ensure server supports WebSocket upgrades
4. Check CORS settings

### Admin Login Issues
1. Verify default credentials are correct
2. Check `JWT_SECRET` environment variable
3. Ensure MongoDB is running
4. Review token expiration in browser storage

### Real-Time Updates Not Working
1. Verify client is authenticated before subscribing
2. Check channel names match exactly
3. Ensure server is broadcasting to correct channel
4. Verify WebSocket is connected (not just initialized)

## Monitoring

### Log Output to Monitor
- `[v0] WebSocket connected` - Client connected
- `[v0] Admin login successful` - Successful admin login
- `[v0] Verification email sent to` - Email sent successfully
- `[v0] Broadcast to X clients on` - Real-time update sent
- `[v0] Email verification error` - Email sending failed

### Key Metrics to Track
- Active WebSocket connections
- Email delivery success rate
- Admin login attempts and failures
- Average verification code wait time
- Real-time message latency

## Performance Optimization

### Already Implemented
- Connection pooling for database
- WebSocket heartbeat every 30 seconds
- Message batching for real-time updates
- Efficient query pagination
- Error recovery and retry logic

### Recommendations
- Implement Redis for verification codes (production)
- Add caching layer for user data
- Enable gzip compression
- Optimize database indexes
- Set up CDN for static assets

## Next Steps

1. **Production Deployment**
   - Update environment variables
   - Change admin credentials
   - Enable HTTPS/WSS
   - Set up monitoring and logging

2. **Additional Features**
   - Two-factor authentication for admin
   - Email templates for different notifications
   - Real-time notifications for users
   - Admin audit dashboard

3. **Testing**
   - Unit tests for services
   - Integration tests for API routes
   - E2E tests for critical flows
   - Load testing for WebSocket

## Support & Documentation

### Available Documentation
- `REAL_TIME_SYSTEM.md` - WebSocket details
- `EMAIL_VERIFICATION_SYSTEM.md` - Email setup
- `ADMIN_AUTHENTICATION.md` - Admin auth details
- API endpoints documentation
- Code comments and JSDoc

### Getting Help
- Check server logs with `[v0]` prefix for debugging
- Review error messages in browser console
- Check environment variables are set correctly
- Verify all services are running (MongoDB, Brevo, etc.)

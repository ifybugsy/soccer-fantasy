# Admin Authentication System

## Overview

Secure admin authentication with JWT tokens, predefined credentials, and role-based access control.

## Default Credentials

\`\`\`
Username: admin
Password: admin123
\`\`\`

**Important**: Change these credentials in production!

## Authentication Flow

### 1. Admin Login
\`\`\`
POST /api/v1/auth/admin-login
{
  "username": "admin",
  "password": "admin123"
}
Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Admin login successful"
}
\`\`\`

### 2. Token Storage
- Token stored in `localStorage` as `admin_token`
- Token expires in 24 hours
- Automatically included in admin API requests

### 3. Protected Routes
- Admin dashboard requires authentication
- Failed auth redirects to `/admin/login`
- Session checked on app load

## Admin Dashboard Features

### User Management
- View all users with pagination
- Suspend/unsuspend users
- Adjust user balance
- View user verification status

### Analytics
- Total users count
- Verification rate
- Active leagues
- Total revenue
- Transaction statistics

### Event Logging
- Track all admin actions
- User balance adjustments
- Account suspensions
- System events

## JWT Token Structure

\`\`\`
Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "userId": "admin",
  "role": "admin",
  "iat": 1234567890,
  "exp": 1234654290  // 24 hours from issue
}
\`\`\`

## Protected API Endpoints

All admin endpoints require `Authorization: Bearer <token>` header.

### User Management
- `GET /api/v1/admin/users` - List users
- `PUT /api/v1/admin/users` - Update user
- `GET /api/v1/admin/event-logs` - View logs

### Dashboard
- `GET /api/v1/admin/dashboard/stats` - Get statistics
- `POST /api/v1/admin/auth/check` - Verify token
- `POST /api/v1/admin/auth/logout` - Logout

## Security Considerations

1. **Password Hashing**: Uses SHA-256 in development (upgrade to bcrypt in production)
2. **HTTPS Only**: Secure flag set for production
3. **HTTP-Only Cookies**: Token stored securely
4. **CORS**: Strict origin validation
5. **Token Expiration**: 24-hour rotation

## Configuration

Environment variables:
\`\`\`
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=hash_of_admin123
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
\`\`\`

## Hooks and Utilities

### `useAdminAuth` Hook
\`\`\`typescript
const { isAuthenticated, isLoading, adminInfo, error, login, logout } = useAdminAuth()
\`\`\`

### Session Management
\`\`\`typescript
import { setAdminToken, getAdminToken, clearAdminToken, isAdminAuthenticated } from "@/lib/admin/admin-session"
\`\`\`

### AdminAuthGuard Component
\`\`\`typescript
<AdminAuthGuard>
  <AdminDashboard />
</AdminAuthGuard>

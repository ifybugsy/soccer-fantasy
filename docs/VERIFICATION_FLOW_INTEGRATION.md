# Complete Verification Flow Integration

## Overview

This document describes the complete end-to-end email verification flow integrated throughout the Soccer Fantasy application.

## Registration Flow

### Step 1: User Registration
\`\`\`
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "username": "player123",
  "password": "securepassword",
  "eFootballCode": "ABC123XYZ"
}

Response:
{
  "success": true,
  "userId": "user_12345",
  "message": "Registration successful"
}
\`\`\`

### Step 2: User Redirected to Verification
\`\`\`
→ Redirect to /auth/verify-email?email=user@example.com
\`\`\`

### Step 3: Send Verification Code
\`\`\`
- Frontend calls useEmailVerification hook
- sendVerificationEmail("user@example.com") is triggered
- Backend sends 6-digit code via Brevo SMTP
- 30-minute timer starts
\`\`\`

### Step 4: User Enters Code
\`\`\`
- User receives code in email
- Enters code in verification form
- Frontend validates and sends verification

POST /api/v1/auth/verify-email-brevo
{
  "action": "verify",
  "email": "user@example.com",
  "code": "123456"
}

Response:
{
  "success": true,
  "message": "Email verified successfully"
}
\`\`\`

### Step 5: User Logs In
\`\`\`
→ Redirect to /auth/login
→ User enters email and password

POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "securepassword"
}

// If email not verified:
{
  "success": false,
  "error": "Email not verified",
  "requiresVerification": true
}

// If verified:
{
  "success": true,
  "userId": "user_12345",
  "username": "player123",
  "email": "user@example.com",
  "emailVerified": true
}
\`\`\`

## Frontend Components

### Email Verification Hook
\`\`\`typescript
const { 
  isLoading, 
  error, 
  success, 
  timeLeft, 
  sendVerificationEmail, 
  verifyEmail, 
  resendEmail 
} = useEmailVerification()
\`\`\`

### Email Verification Form Component
\`\`\`typescript
<EmailVerificationForm 
  email="user@example.com"
  onSuccess={() => router.push('/dashboard')}
/>
\`\`\`

### Usage in Signup
\`\`\`typescript
// After registration, user is redirected
router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`)

// In verify-email page, auto-send code
useEffect(() => {
  if (email && !success && timeLeft === 0) {
    sendVerificationEmail(email)
  }
}, [email, sendVerificationEmail, success, timeLeft])
\`\`\`

## Login Verification Check

### Login Process
1. User submits email and password
2. Backend validates credentials
3. Backend checks emailVerified flag
4. If not verified, return 403 with requiresVerification flag
5. Frontend redirects to /auth/verify-email

### Code in Login Handler
\`\`\`typescript
if (!response.success) {
  if (response.data?.requiresVerification) {
    router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`)
    return
  }
  setError(response.error || "Login failed")
}
\`\`\`

## Security Features

### Rate Limiting
- **Verification Code Send**: 3 attempts per 15 minutes
- **Code Verification**: Multiple attempts allowed (codes contain entropy)
- **Resend Code**: 3 resends per hour
- **Login Attempts**: No limit per attempt (delegate to rate limiter)

### Code Expiration
- Codes expire after 30 minutes
- Expired codes cannot be used
- New codes can be requested via resend

### Input Validation
- Email format validation
- Code format validation (6 digits)
- Password strength requirements
- Username uniqueness check

### Error Messages
\`\`\`
"Email already exists" → User account exists
"User not found" → No account with email
"Code expired" → Need to request new code
"Invalid code" → Wrong verification code
"Too many attempts" → Rate limit exceeded
"Email not verified" → Login blocked until verified
\`\`\`

## Event Logging

### Events Tracked
\`\`\`typescript
// Registration event
{
  type: "user_registered",
  userId: "user_12345",
  data: { email, timestamp }
}

// Email verification event
{
  type: "email_verified",
  userId: "user_12345",
  data: { email, method: "brevo" }
}

// Login event
{
  type: "user_login",
  userId: "user_12345",
  data: { email, timestamp }
}

// Failed login event
{
  type: "login_failed",
  data: { email, reason: "unverified" }
}
\`\`\`

## Admin Dashboard Integration

### User Verification Status
\`\`\`typescript
// View all users with verification status
GET /api/v1/admin/users
- emailVerified: boolean
- verified: boolean (account status)
- createdAt: timestamp

// Admin can manually verify email if needed
PUT /api/v1/admin/users
{
  "userId": "user_12345",
  "action": "update",
  "data": { "emailVerified": true }
}
\`\`\`

### Verification Analytics
\`\`\`typescript
const stats = await adminClient.getDashboardStats()
// Returns:
{
  totalUsers: 1000,
  verifiedUsers: 850,
  verificationRate: "85.00%"
}
\`\`\`

## Testing Verification Flow

### Manual Testing Steps
1. Sign up with test email
2. Receive verification code
3. Enter code in verification form
4. Attempt login without verification (should fail)
5. Complete verification
6. Login successfully

### Testing Resend
1. Request code
2. Wait in verification form
3. Click "Resend Code"
4. Receive new code
5. Verify with new code

### Testing Rate Limits
1. Request 4 codes within 15 minutes
2. 4th attempt should fail with rate limit
3. Wait 15 minutes
4. Try again (should succeed)

## API Integration Checklist

- [x] User registration creates unverified account
- [x] Email verification code sent via Brevo
- [x] Code verification updates user status
- [x] Login checks verification status
- [x] Unverified users redirected to verification
- [x] Resend code functionality
- [x] Rate limiting on code requests
- [x] Event logging for all verification events
- [x] Admin can view verification status
- [x] Admin dashboard shows verification rates

## Troubleshooting

### Email Not Received
1. Check spam/junk folder
2. Verify Brevo credentials in env vars
3. Check server logs for SMTP errors
4. Verify sender email is configured

### Code Not Working
1. Ensure code is entered correctly (6 digits)
2. Check if code has expired (30 min window)
3. Try requesting new code
4. Check browser console for API errors

### Login Fails for Verified Users
1. Clear browser cache/cookies
2. Verify emailVerified flag in database
3. Check password is correct
4. Review server logs for login errors

### Unverified Users Can't Complete Signup
1. Verify email service is running
2. Check rate limits aren't blocking requests
3. Ensure database is accessible
4. Review error messages in frontend

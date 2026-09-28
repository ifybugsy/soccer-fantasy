# Email Verification System

## Overview

Complete email verification system using Brevo SMTP integration with code-based verification flow.

## Setup

### Environment Variables Required

\`\`\`
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SENDER_EMAIL=noreply@yourdomain.com
BREVO_SMTP_KEY=your_brevo_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

## Verification Flow

### 1. User Registration
\`\`\`
User submits registration form
→ Account created with emailVerified: false
→ Redirect to verification page
\`\`\`

### 2. Send Verification Code
\`\`\`
GET /api/v1/auth/verify-email-brevo?action=send&email=user@example.com
Response: 6-digit code sent to email (expires in 30 minutes)
\`\`\`

### 3. Verify Code
\`\`\`
POST /api/v1/auth/verify-email-brevo
{
  "action": "verify",
  "email": "user@example.com",
  "code": "123456"
}
Response: emailVerified: true
\`\`\`

### 4. Resend Code
\`\`\`
POST /api/v1/auth/resend-verification
{
  "email": "user@example.com"
}
Rate limited: 3 resends per hour
\`\`\`

## Code Structure

### Frontend Hook: `useEmailVerification`
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

### Backend Service: `EmailService`
- `sendVerificationEmail(email)` - Initiate verification
- `verifyEmail(email, code)` - Verify code
- `resendVerificationEmail(email)` - Resend code

## Security Features

1. **Rate Limiting**
   - 3 attempts per 15 minutes to send code
   - 3 resends per hour
   - Max 5 verification failures per code

2. **Code Expiration**
   - Codes expire in 30 minutes
   - Codes are 6-digit random numbers
   - Codes are single-use

3. **Email Validation**
   - Email format validation
   - User existence check
   - Prevention of re-verification

## Error Handling

| Error | Status | Cause |
|-------|--------|-------|
| User not found | 404 | Email not registered |
| Code expired | 400 | 30-minute window exceeded |
| Invalid code | 400 | Wrong verification code |
| Too many attempts | 429 | Rate limit exceeded |

## Testing

### Manual Testing
1. Register new account with test email
2. Receive verification code
3. Enter code in verification form
4. Verify email success message

### API Testing
\`\`\`bash
# Send code
curl -X POST http://localhost:3000/api/v1/auth/verify-email-brevo \
  -H "Content-Type: application/json" \
  -d '{"action":"send","email":"test@example.com"}'

# Verify code
curl -X POST http://localhost:3000/api/v1/auth/verify-email-brevo \
  -H "Content-Type: application/json" \
  -d '{"action":"verify","email":"test@example.com","code":"123456"}'

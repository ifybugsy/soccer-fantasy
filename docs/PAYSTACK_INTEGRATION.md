# Paystack Integration Guide

## Overview
This application is configured to use Paystack as the primary payment gateway for deposits and withdrawals.

## Environment Variables
Add these to your `.env.local`:

\`\`\`

\`\`\`

## API Endpoints

### 1. Initialize Payment (Deposit)
**Endpoint:** `POST /api/v1/payment/paystack/initialize`

**Request:**
\`\`\`json
{
  "userId": "user123",
  "amount": 5000,
  "currency": "NGN"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "transactionId": "TXN123ABC",
  "reference": "paystack_reference_xxx",
  "authorizationUrl": "https://checkout.paystack.com/...",
  "accessCode": "access_code_xxx"
}
\`\`\`

**Frontend:** Redirect user to `authorizationUrl` to complete payment.

### 2. Verify Payment
**Endpoint:** `POST /api/v1/payment/paystack/verify`

**Request:**
\`\`\`json
{
  "reference": "paystack_reference_xxx",
  "transactionId": "TXN123ABC"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "transactionId": "TXN123ABC",
  "amount": 5000,
  "status": "completed",
  "newBalance": 15000
}
\`\`\`

### 3. Webhook Endpoint
**Endpoint:** `POST /api/v1/payment/paystack/webhook`

Paystack will send webhooks to this endpoint. Configure in Paystack dashboard:
- **Webhook URL:** `https://yourdomain.com/api/v1/payment/paystack/webhook`
- **Events:** Select "Charge successful"

### 4. Initiate Withdrawal
**Endpoint:** `POST /api/v1/payment/withdraw/paystack`

**Request:**
\`\`\`json
{
  "userId": "user123",
  "amount": 1000,
  "bankCode": "007",
  "accountNumber": "1234567890",
  "accountName": "John Doe"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "transactionId": "WD123ABC",
  "transferCode": "TRF_xxx",
  "reference": "ref_xxx",
  "status": "pending"
}
\`\`\`

### 5. Check Withdrawal Status
**Endpoint:** `POST /api/v1/payment/withdraw/status`

**Request:**
\`\`\`json
{
  "reference": "ref_xxx"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "status": "completed",
  "amount": 1000,
  "reference": "ref_xxx"
}
\`\`\`

## Bank Codes (Nigeria)
- **007** - Zenith Bank
- **011** - First Bank
- **012** - Union Bank
- **044** - Access Bank
- **050** - Ecobank
- **035** - Wema Bank
- **063** - Diamond Bank
- **999** - Nigeese banks (for testing)

[View all bank codes](https://paystack.com/docs/payments/transfers/accepted-nigerian-banks/)

## Security Features
1. **Webhook Signature Verification:** All webhooks are validated using HMAC-SHA512
2. **Transaction Tracking:** All deposits and withdrawals are recorded in MongoDB
3. **Balance Validation:** Withdrawals are only processed if user has sufficient balance
4. **Error Handling:** Comprehensive error handling with detailed logging

## Testing
Use Paystack test credentials for development, then switch to live credentials for production.

### Test Cards
- **Visa:** 4084084084084081 | CVV: 408 | Exp: Any future date
- **Mastercard:** 5399810000000015 | CVV: 589 | Exp: Any future date

## Troubleshooting

### Payment Not Verified
- Verify webhook signature configuration
- Check transaction ID matches
- Ensure PAYSTACK_SECRET_KEY is correct

### Withdrawal Fails
- Verify bank code and account number are correct
- Check user has sufficient balance
- Ensure account name matches bank records

### Webhook Not Received
- Check webhook URL is publicly accessible
- Verify webhook events are enabled in Paystack dashboard
- Check server logs for incoming webhook requests

# Deployment Guide

## Prerequisites
- MongoDB instance (MongoDB Atlas recommended)
- Node.js 18+
- Environment variables configured

## Environment Variables

Create a `.env.local` file:

\`\`\`
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/soccer-fantasy?retryWrites=true&w=majority
MONGODB_DB=soccer-fantasy
NEXT_PUBLIC_API_URL=https://yourdomain.com/api/v1
JWT_SECRET=your-jwt-secret-key
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_KEY=pk_...
\`\`\`

## Deployment Steps

### 1. Local Testing
\`\`\`bash
npm install
npm run dev
# Test endpoints at http://localhost:3000/api/v1
\`\`\`

### 2. Vercel Deployment (WebSocket Limitation)
Vercel doesn't support WebSockets natively. For real-time features:

**Option A: Use REST Polling**
- Clients poll endpoints every 1-2 seconds
- Less efficient but simple
- Included in current implementation

**Option B: Use Vercel KV (Redis)**
- Set up Vercel KV integration
- Use pub/sub for real-time updates
- More scalable

**Option C: Deploy Separately**
- Use Railway, Heroku, or Digital Ocean
- Deploy Next.js app with full WebSocket support

### 3. Database Setup

1. Create MongoDB Atlas account
2. Create cluster and database
3. Get connection string
4. Add to environment variables

### 4. Running Initialization Script

\`\`\`bash
# Via npm script (if added)
npm run db:init

# Or directly with Node
npx ts-node scripts/init-mongodb.ts
\`\`\`

## Production Considerations

1. **Security**
   - Use strong JWT secrets
   - Implement rate limiting
   - Enable MongoDB authentication
   - Use HTTPS only

2. **Payment Processing**
   - Integrate Stripe or similar
   - Verify webhook signatures
   - Use transaction IDs for idempotency
   - Handle payment failures gracefully

3. **Performance**
   - Add MongoDB indexes (done in init script)
   - Use caching for frequently accessed data
   - Implement pagination for large datasets
   - Consider Redis caching layer

4. **Monitoring**
   - Set up error tracking (Sentry)
   - Monitor API response times
   - Track database query performance
   - Set up alerts for critical issues

## Scaling Strategy

As your app grows:

1. **Database**: Use MongoDB Atlas auto-scaling
2. **Cache**: Add Redis for session storage and caching
3. **Queue**: Implement Bull/RabbitMQ for async tasks
4. **WebSockets**: Use dedicated WebSocket server (not on Vercel)
5. **CDN**: Use Vercel Edge for static assets
6. **Search**: Implement Elasticsearch for player/league search

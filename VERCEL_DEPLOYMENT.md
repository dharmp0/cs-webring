# Deploying to Vercel

This project is now configured for deployment on Vercel. The setup includes:

- **Frontend**: React + Vite (deployed as static site)
- **Backend API**: Serverless functions in `/api` directory
- **Email Verification**: Uses Vercel's serverless functions with nodemailer

## Prerequisites

1. **Vercel Account**: Create an account at https://vercel.com
2. **GitHub Integration**: Push your code to GitHub
3. **Email Configuration**: Set up a Gmail app password for nodemailer

## Deployment Steps

### 1. Set Up Gmail App Password

1. Go to Google Account Settings: https://myaccount.google.com/
2. Navigate to Security → App Passwords (requires 2FA enabled)
3. Select Mail and Windows Computer (or appropriate device)
4. Generate a 16-character app password
5. Copy this password (you'll need it for environment variables)

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from project root
vercel
```

#### Option B: Using GitHub Integration

1. Push your code to GitHub
2. Go to https://vercel.com/new
3. Import your GitHub repository
4. Vercel will auto-detect the configuration from vercel.json

### 3. Configure Environment Variables

After connecting your project to Vercel:

1. Go to your project settings in Vercel dashboard
2. Navigate to **Settings → Environment Variables**
3. Add the following variables:

```
EMAIL_USER: your-email@gmail.com
EMAIL_PASSWORD: your-16-char-app-password
FRONTEND_URL: https://your-domain.vercel.app
```

### 4. Deploy

Once environment variables are set:
- If using GitHub integration: Merge to main branch to trigger auto-deployment
- If using Vercel CLI: Run `vercel --prod`

## Project Structure

```
cs-webring/
├── api/                    # Vercel Serverless Functions
│   ├── send-verification.js
│   ├── join-ring.js
│   └── health.js
├── frontend/               # React + Vite
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/                # (Optional) Local development only
├── vercel.json            # Vercel configuration
└── .vercelignore          # Files to exclude from deployment
```

## API Endpoints

After deployment, your API endpoints will be:

- `GET /api/health` - Health check
- `POST /api/send-verification` - Send verification code
- `POST /api/join-ring` - Verify code and join webring

The frontend automatically detects the environment and uses the correct API URL:
- **Local**: `http://localhost:3001` (local development)
- **Production**: `https://your-domain.vercel.app` (Vercel)

## Environment Detection

The frontend uses automatic environment detection in `JoinRing.tsx`:

```typescript
const getApiUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:3001';
  }
  return window.location.origin;
};
```

This means:
- During local development, it uses `localhost:3001`
- In production on Vercel, it uses the Vercel domain

## Local Development

For local development, ensure:

1. Create `.env` in `/backend` with:
```
PORT=3001
FRONTEND_URL=http://localhost:5173
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

2. Start backend: `cd backend && node index.js`
3. Start frontend: `cd frontend && npm run dev`

## Production Considerations

For production deployment, consider:

### Data Persistence
- **Current**: Verification codes stored in memory (lost on function restart)
- **Recommended**: Use Vercel KV (Redis) for persistent storage
- **Alternative**: Use a database (MongoDB, PostgreSQL, etc.)

### Verification Codes Storage
Update `send-verification.js` and `join-ring.js` to use Vercel KV:

```javascript
import { kv } from '@vercel/kv';

// Store code
await kv.set(`verification:${email}`, JSON.stringify({ code, timestamp, ... }), { ex: 600 });

// Retrieve code
const stored = await kv.get(`verification:${email}`);
```

### Email Configuration
- Consider rate limiting to prevent abuse
- Add DKIM/SPF records for better email deliverability
- Monitor email sending quota

## Troubleshooting

### "Failed to fetch" errors
1. Check that environment variables are set in Vercel dashboard
2. Verify CORS settings in API functions (should allow your domain)
3. Check Vercel function logs: Dashboard → Functions → Logs

### Email not sending
1. Verify `EMAIL_USER` and `EMAIL_PASSWORD` are correct
2. Check Gmail app password (not regular password)
3. Ensure "Less secure app access" is NOT required (using app password)
4. Check email quotas and rate limits

### Port conflicts locally
- Change `PORT` in backend/.env to an available port (e.g., 3001)
- Update frontend API URL to match the new port

## Monitoring

Monitor your Vercel deployment:

1. **Vercel Dashboard**: View deployments, logs, and analytics
2. **Function Logs**: Debug API endpoint issues
3. **Error Tracking**: Monitor runtime errors
4. **Analytics**: Track usage and performance

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Node.js on Vercel](https://vercel.com/docs/concepts/runtimes/node-js)

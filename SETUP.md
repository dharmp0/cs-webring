# WLU CS/DS Webring - Setup Guide

This guide walks you through setting up the complete WLU CS/DS Webring project with both frontend and backend for email verification.

## Project Structure

```
cs-webring/
├── frontend/          # React + Vite + TypeScript frontend
├── backend/           # Express.js API server
├── data/              # Static data files
├── scripts/           # Build/sync scripts
└── widget/            # Embeddable webring widget
```

## Prerequisites

- **Node.js** 16+ and npm/yarn
- **Gmail account** (for email sending)

## Quick Start

### 1. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your Gmail credentials:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:5173
PORT=5000
```

#### Setting Up Gmail App Password

1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Ensure 2-step verification is enabled
3. Select "Mail" and "Windows Computer" (or your setup)
4. Google will generate a 16-character app password
5. Copy this password (without spaces) to `.env` as `EMAIL_PASSWORD`

Start the backend:
```bash
npm run dev
```

Backend runs on `http://localhost:5000`

## Features

### Email Verification System

The "Join the Ring" button opens a modal that:

1. **Email Verification Step**
   - User enters their @mylaurier.ca email
   - Backend generates 6-digit code and sends via email
   - User receives verification email

2. **Code Verification Step**
   - User enters 6-digit code from their email
   - Backend validates code (expires after 10 minutes)
   - Max 3 attempts per code
   - On success, user is added to verified members list

### Data Files

- `data/members.json` - Public member list (name, year, website)
- `backend/verified-members.json` - Auto-generated file tracking verified emails

## API Endpoints

### POST `/api/send-verification`
Send verification code to email.

```bash
curl -X POST http://localhost:5000/api/send-verification \
  -H "Content-Type: application/json" \
  -d '{"email":"user@mylaurier.ca"}'
```

### POST `/api/join-ring`
Verify code and register member.

```bash
curl -X POST http://localhost:5000/api/join-ring \
  -H "Content-Type: application/json" \
  -d '{"email":"user@mylaurier.ca","code":"123456"}'
```

### GET `/api/health`
Health check endpoint.

```bash
curl http://localhost:5000/api/health
```

## Development Workflow

### Running Both Services

Open two terminals:

**Terminal 1 (Frontend):**
```bash
cd frontend
npm run dev
```

**Terminal 2 (Backend):**
```bash
cd backend
npm run dev
```

Visit `http://localhost:5173` to see the frontend.

### Testing Email Verification

1. Click "Join the Ring" button at bottom of page
2. Enter a test @mylaurier.ca email (e.g., `test@mylaurier.ca`)
3. Check your email for verification code
4. Enter the code in the modal
5. Success screen appears

### Debugging

**Frontend issues:**
- Check browser console (F12)
- Verify backend is running on http://localhost:5000
- Check CORS errors in network tab

**Backend issues:**
- Check terminal output for errors
- Verify `.env` file has correct Gmail credentials
- Try test endpoint: `curl http://localhost:5000/api/health`

## File Structure Reference

### Frontend Key Files

```
frontend/
├── src/
│   ├── components/
│   │   ├── JoinRing/           # Email verification modal
│   │   ├── Scene/              # Main scroll orchestrator
│   │   ├── BallFieldWebGL/     # 3D ball animation
│   │   ├── MembersList/        # Member display with search
│   │   └── Footer/             # Footer with join button
│   ├── data/
│   │   ├── types.ts            # TypeScript types
│   │   ├── webring.ts          # Data normalization
│   │   └── useWebring.ts       # Data fetching hook
│   └── hooks/                  # Scroll and animation hooks
```

### Backend Key Files

```
backend/
├── index.js                    # Main Express server
├── package.json               # Dependencies
├── .env                       # Configuration (not in git)
├── .env.example              # Configuration template
├── verified-members.json     # Auto-generated verified members
└── README.md                 # Backend documentation
```

## Production Deployment

### Frontend (Vercel)

The frontend automatically deploys from `main` branch.

```bash
# Build
cd frontend
npm run build

# Output goes to frontend/dist/
```

### Backend Deployment Options

#### Option 1: Vercel with Node.js
- Create `/api/` folder at project root
- Move backend code there
- Vercel automatically handles Node.js functions

#### Option 2: Heroku/Railway/Render
```bash
# In backend/ directory
npm run start
```

#### Option 3: Self-hosted (VPS)
- Deploy to your server
- Use process manager like PM2
- Configure environment variables
- Set up reverse proxy (nginx)

### Production Environment Variables

Set these in your deployment platform:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=https://cs-webring.vercel.app
PORT=5000
NODE_ENV=production
```

## Database Consideration

Current implementation stores verified members in `verified-members.json`. For production, consider:

1. **MongoDB**
```bash
npm install mongoose
```

2. **PostgreSQL**
```bash
npm install pg
```

3. **Firebase**
```bash
npm install firebase-admin
```

Update `backend/index.js` to use your database instead of file storage.

## Troubleshooting

### "Failed to send verification code"
- Check Gmail app password (16 characters, no spaces)
- Verify 2-step verification is enabled on Google account
- Check backend logs for email errors

### "Connection refused" errors
- Ensure backend is running (`npm run dev` in backend/)
- Verify `http://localhost:5000` is accessible
- Check CORS settings in backend/index.js

### Code keeps expiring
- Current timeout: 10 minutes
- Edit in backend/index.js: `10 * 60 * 1000`

### Verified members not saving
- Check backend has write permissions to `backend/`
- Verify `verified-members.json` is not in `.gitignore`
- Check file system not full

## Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Nodemailer Guide](https://nodemailer.com/)
- [React Documentation](https://react.dev/)
- [Vite Guide](https://vite.dev/)

## Support

For issues or questions:
1. Check this guide first
2. Review backend/README.md
3. Check frontend error logs
4. Open an issue on GitHub

# CS Webring Backend

Express.js backend API for WLU CS/DS Webring email verification system.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Configure email credentials in `.env`:
   - For Gmail: Use an [App Password](https://myaccount.google.com/apppasswords) (requires 2-step verification enabled)
   - Update `EMAIL_USER` and `EMAIL_PASSWORD`

## Running

Development mode with auto-restart:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server runs on `http://localhost:5000` by default.

## API Endpoints

### POST `/api/send-verification`
Send verification code to user's email.

**Request:**
```json
{
  "email": "user@mylaurier.ca"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification code sent to your email"
}
```

### POST `/api/join-ring`
Verify code and register member.

**Request:**
```json
{
  "email": "user@mylaurier.ca",
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully joined the webring!",
  "member": {
    "email": "user@mylaurier.ca",
    "verifiedAt": "2024-03-04T10:30:00.000Z",
    "name": "user"
  }
}
```

### GET `/api/health`
Health check endpoint.

## Features

- **Email Verification**: Sends 6-digit codes via Gmail
- **Code Expiration**: Codes expire after 10 minutes
- **Attempt Limiting**: Max 3 verification attempts per code
- **Domain Validation**: Only accepts @mylaurier.ca emails
- **Verified Members**: Stores verified members in `verified-members.json`
- **CORS**: Configured for frontend development

## Environment Variables

- `PORT`: Server port (default: 5000)
- `FRONTEND_URL`: Frontend URL for CORS (default: http://localhost:5173)
- `EMAIL_USER`: Gmail address for sending emails
- `EMAIL_PASSWORD`: Gmail app password

## Storage

Verified members are stored in `verified-members.json` in the backend directory.

Example structure:
```json
[
  {
    "email": "user@mylaurier.ca",
    "verifiedAt": "2024-03-04T10:30:00.000Z",
    "name": "user"
  }
]
```

## Production Deployment

For Vercel/production:
1. Set environment variables in deployment platform
2. Ensure email service credentials are secure
3. Consider using a database instead of JSON file for verified members
4. Update frontend API endpoints to point to production backend URL

# API Reference - WLU Webring Email Verification

Base URL: `http://localhost:5000` (development) or `https://your-api.com` (production)

---

## 📤 POST `/api/send-verification`

Send verification code to user's email.

### Request

```http
POST /api/send-verification HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "email": "student@mylaurier.ca"
}
```

### Response - Success (200)

```json
{
  "success": true,
  "message": "Verification code sent to your email"
}
```

### Response - Error (400)

```json
{
  "error": "Please use a valid @mylaurier.ca email address"
}
```

### Response - Error (500)

```json
{
  "error": "Failed to send verification email. Please try again."
}
```

### Validation Rules

| Rule | Description |
|------|-------------|
| Email Format | Must contain `@mylaurier.ca` |
| Email Required | Cannot be empty |

### Backend Actions

1. Validates email format
2. Generates random 6-digit code
3. Stores code with:
   - Current timestamp
   - Attempt counter (0)
4. Sends email with code
5. Returns success/error

### Email Content

Subject: `WLU CS/DS Webring - Email Verification`

Body:
```
Welcome to the WLU CS/DS Webring!

Your verification code is:
123456

This code will expire in 10 minutes.
Enter this code to complete your membership registration.
```

### Code Storage (Server Memory)

```javascript
verificationCodes.set(email, {
  code: "123456",
  timestamp: 1709545800000,
  attempts: 0
})
```

### Expiration Logic

Code expires after `10 * 60 * 1000` milliseconds (10 minutes)

---

## ✅ POST `/api/join-ring`

Verify code and register member.

### Request

```http
POST /api/join-ring HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "email": "student@mylaurier.ca",
  "code": "123456"
}
```

### Response - Success (200)

```json
{
  "success": true,
  "message": "Successfully joined the webring!",
  "member": {
    "email": "student@mylaurier.ca",
    "verifiedAt": "2024-03-04T10:30:00.000Z",
    "name": "student"
  }
}
```

### Response - Error (400)

```json
{
  "error": "Incorrect verification code. Please try again."
}
```

Additional error messages:
- `"Email and code are required"`
- `"Please use a valid @mylaurier.ca email address"`
- `"No verification code found. Please request a new code."`
- `"Verification code has expired. Please request a new one."`
- `"Too many attempts. Please request a new code."`
- `"This email is already registered."`

### Response - Error (500)

```json
{
  "error": "Internal server error"
}
```

### Validation Rules

| Rule | Description |
|------|-------------|
| Email Required | Cannot be empty |
| Code Required | Cannot be empty |
| Email Format | Must match `@mylaurier.ca` |
| Code Format | 6 digits |
| Code Match | Must match generated code |
| Code Expiration | Must be within 10 minutes |
| Attempts | Max 3 incorrect attempts |
| Duplicate Email | Cannot already be registered |

### Backend Actions

1. Validates email and code provided
2. Checks if code exists
3. Validates code hasn't expired
4. Validates attempt count < 3
5. Compares provided code with stored code
   - If wrong: increment attempts, return error
   - If correct: proceed
6. Check for duplicate email
7. Add member to `verified-members.json`
8. Clean up verification code from memory
9. Return success with member object

### Member Storage (JSON File)

File: `backend/verified-members.json`

```json
[
  {
    "email": "student@mylaurier.ca",
    "verifiedAt": "2024-03-04T10:30:00.000Z",
    "name": "student"
  }
]
```

Field Descriptions:
- `email`: User's @mylaurier.ca email address
- `verifiedAt`: ISO 8601 timestamp of verification
- `name`: Username extracted from email (before @)

---

## 🏥 GET `/api/health`

Health check endpoint for monitoring.

### Request

```http
GET /api/health HTTP/1.1
Host: localhost:5000
```

### Response (200)

```json
{
  "status": "ok",
  "timestamp": "2024-03-04T10:30:00.000Z"
}
```

### Use Case

Verify API server is running and responding to requests.

### Example Usage

```bash
curl http://localhost:5000/api/health
```

---

## 📋 Common Usage Scenarios

### Scenario 1: User Joins for First Time

```
1. User clicks "Join Ring" button
2. Modal opens with email input
3. User enters: student@mylaurier.ca
4. Frontend calls: POST /api/send-verification
   Response: ✓ Code sent
5. User receives email with code: 123456
6. User enters code in modal: 123456
7. Frontend calls: POST /api/join-ring
   Response: ✓ Successfully joined
8. User sees success screen
```

### Scenario 2: Code Expired

```
1. User requests code at 10:00 AM
2. User returns at 10:15 AM
3. User enters code
4. Frontend calls: POST /api/join-ring
   Response: ✗ Code expired
5. User clicks "Send New Code"
6. Process repeats from step 1
```

### Scenario 3: Wrong Code (Too Many Times)

```
1. User requests code
2. User enters wrong code 3 times:
   - Attempt 1: Wrong code ✗
   - Attempt 2: Wrong code ✗
   - Attempt 3: Wrong code ✗
3. Response: "Too many attempts. Request new code."
4. User must request new code to retry
```

### Scenario 4: Invalid Email

```
1. User enters: student@gmail.com (wrong domain)
2. Frontend validation catches: Not @mylaurier.ca
3. Shows error: "Please use a valid @mylaurier.ca email"
4. No API call made (client-side validation)
5. User cannot proceed until correct email
```

---

## 🔌 Integration Examples

### JavaScript/TypeScript (Frontend)

```typescript
// Send verification code
const response = await fetch("http://localhost:5000/api/send-verification", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "user@mylaurier.ca" }),
});

const data = await response.json();
if (response.ok) {
  console.log(data.message); // "Verification code sent..."
} else {
  console.error(data.error);
}

// Verify code
const response = await fetch("http://localhost:5000/api/join-ring", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "user@mylaurier.ca",
    code: "123456"
  }),
});

const data = await response.json();
if (response.ok) {
  console.log("Member joined:", data.member);
} else {
  console.error(data.error);
}
```

### cURL

```bash
# Send verification code
curl -X POST http://localhost:5000/api/send-verification \
  -H "Content-Type: application/json" \
  -d '{"email":"user@mylaurier.ca"}'

# Verify code
curl -X POST http://localhost:5000/api/join-ring \
  -H "Content-Type: application/json" \
  -d '{"email":"user@mylaurier.ca","code":"123456"}'

# Health check
curl http://localhost:5000/api/health
```

### Python

```python
import requests

# Send verification code
response = requests.post(
    "http://localhost:5000/api/send-verification",
    json={"email": "user@mylaurier.ca"}
)
print(response.json())

# Verify code
response = requests.post(
    "http://localhost:5000/api/join-ring",
    json={
        "email": "user@mylaurier.ca",
        "code": "123456"
    }
)
print(response.json())
```

---

## 📊 Rate Limits & Quotas

Current Implementation (Development):

| Limit | Value |
|-------|-------|
| Code Expiration | 10 minutes |
| Max Attempts | 3 per code |
| Email Domain | @mylaurier.ca only |
| Memory Storage | In-memory (lost on restart) |

For Production:
- Implement Redis for code storage
- Add rate limiting per IP (e.g., 5 requests/hour)
- Add rate limiting per email (e.g., 1 request/minute)
- Use database for verified members

---

## 🔒 Security Considerations

### What's Secured ✓
- Email validation (domain check)
- Code expiration (10 minutes)
- Attempt limiting (3 tries)
- CORS configuration
- No credentials in code (env variables)

### Not Yet Implemented
- Rate limiting (add soon)
- HTTPS enforcement (production only)
- Request logging (for audit trail)
- Database encryption (for sensitive data)

### Recommendations
1. Enable HTTPS in production
2. Implement rate limiting
3. Use database for member storage
4. Add request logging for security audit
5. Monitor failed verification attempts

---

## 🐛 Error Codes

| HTTP Code | Meaning |
|-----------|---------|
| 200 | Success |
| 400 | Bad Request (validation error) |
| 500 | Server Error |

### Common Errors

| Error Message | Cause | Fix |
|---------------|-------|-----|
| "Email required" | Missing email in request | Add email field |
| "Invalid email format" | Not @mylaurier.ca | Use Laurier email |
| "Code expired" | > 10 minutes elapsed | Request new code |
| "Too many attempts" | 3+ wrong codes | Request new code |
| "Code mismatch" | Wrong code entered | Check email and retry |
| "Already registered" | Email already joined | Use different email |
| "Email send failed" | SMTP error | Check backend logs |

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Verify email credentials work
- [ ] Test all endpoints with cURL
- [ ] Verify CORS settings for production domain
- [ ] Set environment variables correctly
- [ ] Test with real Gmail account
- [ ] Implement rate limiting
- [ ] Set up monitoring/logging
- [ ] Consider database for members
- [ ] Enable HTTPS
- [ ] Add request validation
- [ ] Set up automated backups

---

## 📞 Support

For API issues:
1. Check this reference
2. Review backend/README.md
3. Check backend logs
4. Test with cURL first
5. Verify .env configuration

Email sending issues:
1. Test Gmail app password
2. Verify 2-step verification enabled
3. Check internet connection
4. Review nodemailer logs
5. Try different email service

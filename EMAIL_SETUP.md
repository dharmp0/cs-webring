# Email Configuration for WLU Webring

## Where to Add Your Sender Email

### Step 1: Create `.env` file in the `backend/` directory

Copy from `backend/.env.example`:
```bash
cp backend/.env.example backend/.env
```

### Step 2: Edit `backend/.env` with Your Gmail Account

```env
# The Gmail account that will SEND the verification emails
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

**Important:** 
- `EMAIL_USER` = The email address FROM which verification codes will be sent
- `EMAIL_PASSWORD` = Your App Password (NOT your regular Gmail password)

### Step 3: Set Up Gmail App Password (Required)

Gmail doesn't allow your regular password in applications for security. You need an "App Password":

1. Go to: **https://myaccount.google.com/apppasswords**
2. Sign in with the Gmail account you want to use
3. If prompted, enable 2-step verification first
4. Select:
   - **App:** Mail
   - **Device:** Windows Computer (or your OS)
5. Google generates a **16-character password** (with spaces)
6. Copy this and paste to `backend/.env` as `EMAIL_PASSWORD`

**Example:**
```env
EMAIL_USER=cs-webring-admin@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

### Step 4: Test It Works

Run the backend:
```bash
cd backend
npm run dev
```

When you submit the form:
1. Enter a test Laurier ID: `test1234`
2. Check the Gmail account's **Sent** folder
3. You should see an email from `cs-webring-admin@gmail.com`

### Using a Custom Email Service

If you don't want to use Gmail, you can modify `backend/index.js` to use:

**SendGrid:**
```javascript
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
```

**AWS SES:**
```javascript
import AWS from 'aws-sdk';
const ses = new AWS.SES();
```

**Any SMTP Server:**
```javascript
const transporter = nodemailer.createTransport({
  host: 'your-smtp-server.com',
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

## Troubleshooting

### "Failed to send verification code"

1. **Check `.env` file exists:**
   ```bash
   ls -la backend/.env
   ```

2. **Verify `EMAIL_USER` is correct:**
   ```bash
   grep EMAIL_USER backend/.env
   ```

3. **Test Gmail access:**
   - Go to https://myaccount.google.com/security
   - Check "Less secure app access" is enabled (for older Gmail accounts)
   - OR verify App Password is set correctly

4. **Check backend logs:**
   ```bash
   npm run dev    # Watch for error messages
   ```

### "Invalid email credentials"

1. App Password should be 16 characters (without spaces in `.env`)
2. Make sure you have 2-step verification enabled
3. Generate a new App Password if uncertain

### "Message rejected"

1. Gmail account may have sending limits (100-500 per day)
2. Wait a few minutes and try again
3. Consider using SendGrid for higher limits

## Email Template Customization

Edit the email template in `backend/index.js`:

```javascript
await transporter.sendMail({
  from: process.env.EMAIL_USER,  // Your sender email
  to: email,                      // User's @mylaurier.ca email
  subject: 'WLU CS/DS Webring - Email Verification',
  html: `
    <h2>Welcome to the WLU CS/DS Webring!</h2>
    <p>Your verification code is:</p>
    <h1>${code}</h1>
    <p>This code will expire in 10 minutes.</p>
  `
});
```

Customize the subject, title, colors, and message as needed!

## Summary

1. ✅ Gmail account ready
2. ✅ App Password generated
3. ✅ Add credentials to `backend/.env`
4. ✅ Run `npm run dev` in backend/
5. ✅ Test by clicking "Join the Ring"
6. ✅ Check Gmail Sent folder for test email

**Questions?** Check `SETUP.md` or `backend/README.md` for more details.

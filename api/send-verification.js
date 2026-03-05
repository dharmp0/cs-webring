import nodemailer from 'nodemailer';

// In-memory storage for verification codes (consider using Vercel KV for production)
const verificationCodes = new Map();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Validate @mylaurier.ca domain
  if (!email.endsWith('@mylaurier.ca')) {
    return res.status(400).json({ error: 'Only @mylaurier.ca emails are allowed' });
  }

  try {
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store code with email and timestamp (expires in 10 minutes)
    verificationCodes.set(email, {
      code,
      timestamp: Date.now(),
      attempts: 0,
      maxAttempts: 3
    });

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'WLU CS/DS Webring - Email Verification',
      html: `
        <h2>Email Verification</h2>
        <p>Thank you for joining the WLU CS/DS Webring!</p>
        <p>Your verification code is:</p>
        <h1 style="color: #2c3e50; font-size: 32px; letter-spacing: 5px;">${code}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: 'Verification code sent to your email'
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({
      error: 'Failed to send verification email',
      details: error.message
    });
  }
}

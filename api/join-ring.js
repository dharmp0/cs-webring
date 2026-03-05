import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// In-memory storage for verification codes (should match send-verification.js)
const verificationCodes = new Map();

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

  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code are required' });
  }

  try {
    // Check if code exists and is valid
    const stored = verificationCodes.get(email);

    if (!stored) {
      return res.status(400).json({ error: 'No verification code sent for this email' });
    }

    // Check if code has expired (10 minutes = 600000 ms)
    if (Date.now() - stored.timestamp > 600000) {
      verificationCodes.delete(email);
      return res.status(400).json({ error: 'Verification code has expired' });
    }

    // Check attempts
    if (stored.attempts >= stored.maxAttempts) {
      verificationCodes.delete(email);
      return res.status(400).json({ error: 'Too many failed attempts. Please request a new code' });
    }

    // Verify code
    if (stored.code !== code) {
      stored.attempts++;
      return res.status(400).json({ 
        error: 'Invalid code',
        attemptsRemaining: stored.maxAttempts - stored.attempts
      });
    }

    // Code is valid - mark email as verified
    verificationCodes.delete(email);

    // Get the Laurier ID from email (remove @mylaurier.ca)
    const laurierId = email.replace('@mylaurier.ca', '');

    // In production with Vercel, you might use:
    // - Vercel KV for session storage
    // - A database to store verified emails
    // For now, return success
    return res.status(200).json({
      success: true,
      message: 'Email verified successfully!',
      email,
      laurierId
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    return res.status(500).json({
      error: 'Failed to verify email',
      details: error.message
    });
  }
}

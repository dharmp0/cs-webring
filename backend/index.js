import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync } from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// In-memory storage for verification codes (in production, use a database)
const verificationCodes = new Map();

// Path to members file
const membersFilePath = join(__dirname, '..', 'data', 'members.json');
const verifiedMembersFilePath = join(__dirname, 'verified-members.json');

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Helper function to read JSON file
const readJsonFile = (filePath) => {
  try {
    const data = readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
};

// Helper function to write JSON file
const writeJsonFile = (filePath, data) => {
  try {
    writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
};

// Generate random 6-digit code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email endpoint
app.post('/api/send-verification', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email format
    if (!email || !email.match(/@mylaurier\.ca$/)) {
      return res.status(400).json({ 
        error: 'Please use a valid @mylaurier.ca email address' 
      });
    }

    // Generate verification code
    const code = generateVerificationCode();
    verificationCodes.set(email, {
      code,
      timestamp: Date.now(),
      attempts: 0
    });

    // Send email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'WLU CS/DS Webring - Email Verification',
        html: `
          <h2>Welcome to the WLU CS/DS Webring!</h2>
          <p>Your verification code is:</p>
          <h1 style="font-size: 32px; font-weight: bold; letter-spacing: 4px;">${code}</h1>
          <p>This code will expire in 10 minutes.</p>
          <p>Enter this code to complete your membership registration.</p>
          <hr>
          <p style="font-size: 12px; color: #666;">If you didn't request this code, please ignore this email.</p>
        `
      });

      res.json({ 
        success: true, 
        message: 'Verification code sent to your email' 
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return res.status(500).json({ 
        error: 'Failed to send verification email. Please try again.' 
      });
    }
  } catch (error) {
    console.error('Error in send-verification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Join ring endpoint (verify code and add member)
app.post('/api/join-ring', async (req, res) => {
  try {
    const { email, code } = req.body;

    // Validate inputs
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }

    // Validate email format
    if (!email.match(/@mylaurier\.ca$/)) {
      return res.status(400).json({ 
        error: 'Please use a valid @mylaurier.ca email address' 
      });
    }

    // Check if code exists and is valid
    const stored = verificationCodes.get(email);
    if (!stored) {
      return res.status(400).json({ error: 'No verification code found. Please request a new code.' });
    }

    // Check if code has expired (10 minutes)
    if (Date.now() - stored.timestamp > 10 * 60 * 1000) {
      verificationCodes.delete(email);
      return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
    }

    // Check attempt limit
    if (stored.attempts >= 3) {
      verificationCodes.delete(email);
      return res.status(400).json({ error: 'Too many attempts. Please request a new code.' });
    }

    // Verify code
    if (stored.code !== code) {
      stored.attempts += 1;
      return res.status(400).json({ error: 'Incorrect verification code. Please try again.' });
    }

    // Code is valid - add member to verified list
    const verifiedMembers = readJsonFile(verifiedMembersFilePath);
    
    // Check if member already exists
    if (verifiedMembers.some(m => m.email === email)) {
      verificationCodes.delete(email);
      return res.status(400).json({ error: 'This email is already registered.' });
    }

    // Add new member
    const newMember = {
      email,
      verifiedAt: new Date().toISOString(),
      name: email.split('@')[0] // Use part before @ as default name
    };

    verifiedMembers.push(newMember);
    writeJsonFile(verifiedMembersFilePath, verifiedMembers);

    // Clean up verification code
    verificationCodes.delete(email);

    res.json({ 
      success: true, 
      message: 'Successfully joined the webring!',
      member: newMember
    });
  } catch (error) {
    console.error('Error in join-ring:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`CORS enabled for ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

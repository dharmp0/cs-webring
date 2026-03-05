#!/bin/bash

# WLU CS/DS Webring - Quick Setup Script
# This script sets up both frontend and backend

set -e

echo "🔗 WLU CS/DS Webring - Setup Script"
echo "===================================="
echo ""

# Check Node.js installation
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Frontend setup
echo "📦 Setting up Frontend..."
cd frontend
npm install
echo "✅ Frontend dependencies installed"
cd ..
echo ""

# Backend setup
echo "📦 Setting up Backend..."
cd backend

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Configure your Gmail credentials in backend/.env"
    echo "   1. Go to https://myaccount.google.com/apppasswords"
    echo "   2. Generate an App Password"
    echo "   3. Update EMAIL_USER and EMAIL_PASSWORD in backend/.env"
    echo ""
    read -p "Press Enter once you've configured backend/.env..."
fi

npm install
echo "✅ Backend dependencies installed"
cd ..
echo ""

# Summary
echo "✅ Setup Complete!"
echo ""
echo "📖 Next Steps:"
echo "1. Configure Gmail in backend/.env (if not already done)"
echo "2. Run in separate terminals:"
echo ""
echo "   Terminal 1 (Frontend):"
echo "   $ cd frontend && npm run dev"
echo ""
echo "   Terminal 2 (Backend):"
echo "   $ cd backend && npm run dev"
echo ""
echo "3. Visit http://localhost:5173 in your browser"
echo "4. Click 'Join the Ring' to test email verification"
echo ""
echo "📚 Documentation: See SETUP.md and EMAIL_VERIFICATION.md"
echo ""

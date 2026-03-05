#!/bin/bash

# WLU CS/DS Webring - Quick Vercel Deploy Script
# This script automates the deployment process

set -e

echo "🚀 WLU CS/DS Webring - Vercel Deployment Script"
echo "================================================"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "✅ Vercel CLI ready"
echo ""

# Check if user is logged in
echo "Checking Vercel login status..."
if ! vercel whoami &> /dev/null; then
    echo "📝 Please log in to Vercel:"
    vercel login
fi

echo ""
echo "📋 Deployment Configuration"
echo "================================================"
echo "Environment: Production"
echo "Frontend: React + Vite"
echo "Backend: Vercel Serverless Functions"
echo "Build Command: cd frontend && npm run build"
echo ""

# Verify frontend builds
echo "🔨 Testing frontend build..."
cd frontend
npm run build > /dev/null 2>&1
cd ..
echo "✅ Frontend builds successfully"
echo ""

# Check environment variables
echo "🔐 Environment Variables"
echo "================================================"
echo "Required variables for Vercel:"
echo "  - EMAIL_USER (your Gmail address)"
echo "  - EMAIL_PASSWORD (Gmail app password)"
echo "  - FRONTEND_URL (optional, will default to Vercel domain)"
echo ""

# Confirm before deploying
echo "⚠️  Ready to deploy to production?"
read -p "Continue? (yes/no) " -n 3 -r
echo ""

if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo ""
    echo "🚀 Deploying to Vercel..."
    vercel --prod
    echo ""
    echo "✅ Deployment complete!"
    echo ""
    echo "📍 Next steps:"
    echo "1. Set environment variables in Vercel Dashboard"
    echo "2. Test the app at your new URL"
    echo "3. Verify email verification flow works"
    echo ""
    echo "📚 For detailed info, see VERCEL_DEPLOYMENT.md"
else
    echo "❌ Deployment cancelled"
    exit 0
fi

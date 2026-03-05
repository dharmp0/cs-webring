#!/bin/bash

# WLU CS/DS Webring - Vercel Deployment Commands

# ============================================
# LOCAL DEVELOPMENT
# ============================================

# Start backend (port 3001)
backend-dev() {
  cd backend
  node index.js
}

# Start frontend (port 5173)
frontend-dev() {
  cd frontend
  npm run dev
}

# Start both (requires two terminals)
dev-all() {
  echo "Starting backend..."
  (cd backend && node index.js) &
  echo "Starting frontend..."
  (cd frontend && npm run dev) &
  wait
}

# ============================================
# BUILD
# ============================================

# Build frontend for production
build() {
  cd frontend
  npm run build
}

# Build and preview
build-preview() {
  cd frontend
  npm run build
  npm run preview
}

# ============================================
# VERCEL DEPLOYMENT
# ============================================

# Install Vercel CLI
vercel-install() {
  npm install -g vercel
}

# Link project to Vercel
vercel-link() {
  vercel link
}

# Pull environment variables from Vercel
vercel-env-pull() {
  vercel env pull
}

# Deploy to production
vercel-deploy() {
  vercel --prod
}

# Deploy to preview
vercel-preview() {
  vercel
}

# View Vercel project dashboard
vercel-dashboard() {
  open "https://vercel.com/dashboard"
}

# View deployment logs
vercel-logs() {
  vercel logs
}

# ============================================
# TESTING
# ============================================

# Test API health endpoint locally
test-health() {
  curl http://localhost:3001/api/health
  echo ""
}

# Test with production URL
test-health-prod() {
  if [ -z "$VERCEL_URL" ]; then
    echo "VERCEL_URL not set. Deploy first."
    return 1
  fi
  curl https://$VERCEL_URL/api/health
  echo ""
}

# ============================================
# CLEANUP
# ============================================

# Kill all Node processes
kill-nodes() {
  pkill -f "node index.js"
  pkill -f "vite"
}

# Clean node_modules
clean() {
  rm -rf frontend/node_modules backend/node_modules node_modules
  rm -f frontend/package-lock.json backend/package-lock.json package-lock.json
}

# Reinstall dependencies
reinstall() {
  cd frontend && npm install
  cd ../backend && npm install
  cd ..
}

# ============================================
# GIT
# ============================================

# Push changes to GitHub (triggers Vercel deployment if connected)
push-deploy() {
  git add .
  git commit -m "Deployment update"
  git push origin Yash-Branch
}

# ============================================
# ENVIRONMENT
# ============================================

# Set local environment variables
set-env() {
  cat > backend/.env << EOF
PORT=3001
FRONTEND_URL=http://localhost:5173
EMAIL_USER=$1
EMAIL_PASSWORD=$2
EOF
  echo "Environment variables set"
}

# Show environment variables
show-env() {
  echo "=== Backend Environment ==="
  cat backend/.env
  echo ""
  echo "=== Vercel Environment ==="
  vercel env list
}

# ============================================
# HELP
# ============================================

help() {
  echo "WLU CS/DS Webring - Vercel Deployment Commands"
  echo ""
  echo "LOCAL DEVELOPMENT:"
  echo "  backend-dev              Start backend server"
  echo "  frontend-dev             Start frontend dev server"
  echo "  dev-all                  Start both (two terminals needed)"
  echo ""
  echo "BUILD:"
  echo "  build                    Build frontend for production"
  echo "  build-preview            Build and preview locally"
  echo ""
  echo "VERCEL DEPLOYMENT:"
  echo "  vercel-install           Install Vercel CLI"
  echo "  vercel-link              Link project to Vercel"
  echo "  vercel-env-pull          Pull environment variables"
  echo "  vercel-deploy            Deploy to production"
  echo "  vercel-preview           Deploy to preview"
  echo "  vercel-dashboard         Open Vercel dashboard"
  echo "  vercel-logs              View deployment logs"
  echo ""
  echo "TESTING:"
  echo "  test-health              Test health endpoint locally"
  echo "  test-health-prod         Test health endpoint on Vercel"
  echo ""
  echo "CLEANUP:"
  echo "  kill-nodes               Kill all Node processes"
  echo "  clean                    Remove node_modules and lock files"
  echo "  reinstall                Reinstall all dependencies"
  echo ""
  echo "GIT:"
  echo "  push-deploy              Push to GitHub (triggers Vercel)"
  echo ""
  echo "ENVIRONMENT:"
  echo "  set-env <email> <pass>   Set local environment variables"
  echo "  show-env                 Show environment variables"
  echo ""
  echo "HELP:"
  echo "  help                     Show this help message"
}

# Show help by default
if [ $# -eq 0 ]; then
  help
fi

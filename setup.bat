@echo off
REM WLU CS/DS Webring - Quick Setup Script (Windows)
REM This script sets up both frontend and backend

echo.
echo 🔗 WLU CS/DS Webring - Setup Script (Windows)
echo ============================================
echo.

REM Check Node.js installation
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ first.
    pause
    exit /b 1
)

echo ✅ Node.js installed
echo.

REM Frontend setup
echo 📦 Setting up Frontend...
cd frontend
call npm install
echo ✅ Frontend dependencies installed
cd ..
echo.

REM Backend setup
echo 📦 Setting up Backend...
cd backend

if not exist .env (
    echo 📝 Creating .env from .env.example...
    copy .env.example .env
    echo.
    echo ⚠️  IMPORTANT: Configure your Gmail credentials in backend\.env
    echo    1. Go to https://myaccount.google.com/apppasswords
    echo    2. Generate an App Password
    echo    3. Update EMAIL_USER and EMAIL_PASSWORD in backend\.env
    echo.
    pause
)

call npm install
echo ✅ Backend dependencies installed
cd ..
echo.

REM Summary
echo ✅ Setup Complete!
echo.
echo 📖 Next Steps:
echo 1. Configure Gmail in backend\.env (if not already done)
echo 2. Run in separate terminals:
echo.
echo    Terminal 1 (Frontend^):
echo    cd frontend ^& npm run dev
echo.
echo    Terminal 2 (Backend^):
echo    cd backend ^& npm run dev
echo.
echo 3. Visit http://localhost:5173 in your browser
echo 4. Click 'Join the Ring' to test email verification
echo.
echo 📚 Documentation: See SETUP.md and EMAIL_VERIFICATION.md
echo.
pause

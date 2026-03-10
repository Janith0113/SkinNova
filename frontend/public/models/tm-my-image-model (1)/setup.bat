@echo off
REM Tinea Detector - Quick Setup Script for Windows

echo.
echo Tinea Detector - Quick Setup
echo ============================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    echo Error: Node.js is not installed
    echo Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo Node.js %NODE_VERSION% found
echo.

REM Check if npm is installed
where npm >nul 2>nul
if errorlevel 1 (
    echo Error: npm is not installed
    exit /b 1
)

echo npm is installed
echo.

REM Install dependencies
echo Installing dependencies...
call npm install

echo.
echo =================================
echo Setup Instructions:
echo =================================
echo.
echo 1. Copy your model files to public\model\:
echo    - metadata.json
echo    - model.json
echo    - weights.bin
echo.
echo 2. Start the development server:
echo    npm run dev
echo.
echo 3. Open http://localhost:3000 in your browser
echo.
echo Setup complete! Happy detecting!
pause

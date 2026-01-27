@echo off
REM Kill any existing node processes
taskkill /F /IM node.exe >nul 2>&1

REM Start both servers
echo Starting SkinNova Full-Stack Application...
echo Backend: http://localhost:4000
echo Frontend: http://localhost:3000

npm run dev

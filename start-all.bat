@echo off
REM Kill any existing node processes
taskkill /F /IM node.exe >nul 2>&1

REM Start both servers
echo Starting SkinNova Full-Stack Application...
echo Backend:              http://localhost:4000
echo Frontend:             http://localhost:3000
echo AI Prediction Server: http://localhost:5001

REM Start the Python AI prediction server in a new window
echo.
echo Checking for trained leprosy model...
if exist "leprosy_model.pkl" (
    echo Model found. Starting AI prediction server...
    start "Leprosy AI Prediction Server" cmd /k "python leprosy_prediction_server.py"
) else (
    echo WARNING: leprosy_model.pkl not found.
    echo          Run 'python leprosy_model_training.py' first to train the model.
    echo          Starting server anyway - predictions will be unavailable until model is trained.
    start "Leprosy AI Prediction Server" cmd /k "python leprosy_prediction_server.py"
)

REM Small delay to let Python server initialize
timeout /t 2 /nobreak >nul

npm run dev

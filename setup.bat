@echo off
REM =================================================================
REM Leprosy Prediction AI Model - Setup Script (Windows)
REM =================================================================

echo.
echo ===================================================================
echo       LEPROSY PREDICTION AI MODEL - QUICK SETUP AND TRAINING
echo ===================================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/
    pause
    exit /b 1
)

echo [1/4] Installing dependencies...
python -m pip install -r requirements.txt
if errorlevel 1 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)
echo Done!
echo.

echo [2/4] Creating sample dataset...
python -c "from data_processor import prepare_dataset; prepare_dataset(create_sample=True)"
if errorlevel 1 (
    echo Warning: Failed to create sample dataset
)
echo.

echo [3/4] Training Leprosy Prediction Model...
python leprosy_model_training.py
if errorlevel 1 (
    echo Error: Model training failed
    pause
    exit /b 1
)
echo.

echo [4/4] Running demo prediction...
python -c "from leprosy_inference import demo_prediction; demo_prediction()"
echo.

echo ===================================================================
echo ^> SETUP COMPLETE!
echo ===================================================================
echo.
echo Your leprosy prediction model is ready to use!
echo.
echo Next steps:
echo   1. Train with your own data:
echo      python leprosy_model_training.py
echo   2. Make predictions:
echo      python leprosy_inference.py
echo   3. Import your data:
echo      python data_importer.py
echo   4. Read the guide:
echo      LEPROSY_PREDICTION_GUIDE.md
echo.
pause

@echo off
REM Grade 5 Scholarship Exam Platform - Portable Version Startup
REM No Docker Required - Direct Execution

echo ========================================
echo Grade 5 Scholarship Exam Platform
echo Education Reforms Bureau - Portable Version
echo ========================================
echo.

REM Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed!
    echo Please install Python 3.11 from: https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo [1/5] Starting MongoDB (Portable)...
cd portable_mongodb
start /B mongod --dbpath=data --port=27017 --bind_ip=127.0.0.1
cd ..
timeout /t 3 /nobreak >nul

echo [2/5] Installing Backend Dependencies...
cd backend
if not exist "venv" (
    python -m venv venv
)
call venv\Scripts\activate
pip install -q -r requirements.txt
cd ..

echo [3/5] Installing Frontend Dependencies...
cd frontend
if not exist "node_modules" (
    call yarn install
)
cd ..

echo [4/5] Starting Backend Server...
cd backend
start /B cmd /c "venv\Scripts\activate && python server.py"
cd ..
timeout /t 5 /nobreak >nul

echo [5/5] Starting Frontend...
cd frontend
start /B cmd /c "yarn start"
cd ..

echo.
echo Waiting for services to start...
timeout /t 15 /nobreak >nul

start http://localhost:3000

echo.
echo ========================================
echo ✓ Application Started!
echo ========================================
echo.
echo Access at: http://localhost:3000
echo.
echo To STOP: Run STOP_PORTABLE.bat
echo.
pause

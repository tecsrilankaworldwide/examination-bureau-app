@echo off
REM Grade 5 Scholarship Exam Platform - Windows Startup Script
REM Education Reforms Bureau

echo ========================================
echo Grade 5 Scholarship Exam Platform
echo Education Reforms Bureau
echo ========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker Desktop is not installed!
    echo.
    echo Please install Docker Desktop first:
    echo https://www.docker.com/products/docker-desktop
    echo.
    pause
    exit /b 1
)

echo [1/4] Checking Docker Desktop...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker Desktop is not running!
    echo Please start Docker Desktop and try again.
    echo.
    pause
    exit /b 1
)
echo ✓ Docker Desktop is running

echo.
echo [2/4] Starting database and services...
docker-compose -f docker-compose.production.yml up -d

if %errorlevel% neq 0 (
    echo ERROR: Failed to start services!
    echo Please check Docker Desktop logs.
    pause
    exit /b 1
)

echo.
echo [3/4] Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo.
echo [4/4] Opening application...
start http://localhost:3000

echo.
echo ========================================
echo ✓ Application Started Successfully!
echo ========================================
echo.
echo The exam platform is now running at:
echo http://localhost:3000
echo.
echo Test Credentials:
echo - Admin: admin@test.com / admin123
echo - Teacher: teacher@test.com / teacher123
echo - Student: student@test.com / student123
echo - Parent: parent@test.com / parent123
echo.
echo To STOP the application, run: STOP_APPLICATION.bat
echo.
echo Press any key to close this window...
pause >nul

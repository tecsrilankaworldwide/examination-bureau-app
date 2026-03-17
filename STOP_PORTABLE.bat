@echo off
echo Stopping Grade 5 Scholarship Exam Platform (Portable)...

REM Stop Node.js (Frontend)
taskkill /F /IM node.exe >nul 2>&1

REM Stop Python (Backend)
taskkill /F /IM python.exe >nul 2>&1

REM Stop MongoDB
taskkill /F /IM mongod.exe >nul 2>&1

echo.
echo ✓ Application stopped!
pause

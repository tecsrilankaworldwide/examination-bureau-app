#!/bin/bash
# Grade 5 Scholarship Exam Platform - Linux/Mac Startup Script
# Education Reforms Bureau

echo "========================================"
echo "Grade 5 Scholarship Exam Platform"
echo "Education Reforms Bureau"
echo "========================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed!"
    echo ""
    echo "Please install Docker first:"
    echo "https://docs.docker.com/get-docker/"
    echo ""
    exit 1
fi

echo "[1/4] Checking Docker..."
if ! docker info &> /dev/null; then
    echo "ERROR: Docker is not running!"
    echo "Please start Docker and try again."
    exit 1
fi
echo "✓ Docker is running"

echo ""
echo "[2/4] Starting database and services..."
docker-compose -f docker-compose.production.yml up -d

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to start services!"
    echo "Please check Docker logs."
    exit 1
fi

echo ""
echo "[3/4] Waiting for services to be ready..."
sleep 10

echo ""
echo "[4/4] Opening application..."
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
elif command -v open &> /dev/null; then
    open http://localhost:3000
fi

echo ""
echo "========================================"
echo "✓ Application Started Successfully!"
echo "========================================"
echo ""
echo "The exam platform is now running at:"
echo "http://localhost:3000"
echo ""
echo "Test Credentials:"
echo "- Admin: admin@test.com / admin123"
echo "- Teacher: teacher@test.com / teacher123"
echo "- Student: student@test.com / student123"
echo "- Parent: parent@test.com / parent123"
echo ""
echo "To STOP the application, run: ./STOP_APPLICATION.sh"
echo ""

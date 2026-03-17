#!/bin/bash
# Grade 5 Scholarship Exam Platform - Portable Version
# No Docker Required

echo "========================================"
echo "Grade 5 Scholarship Exam Platform"
echo "Education Reforms Bureau - Portable Version"
echo "========================================"
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed!"
    echo "Install from: https://www.python.org/downloads/"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Install from: https://nodejs.org/"
    exit 1
fi

echo "[1/5] Starting MongoDB (Portable)..."
cd portable_mongodb
mkdir -p data
./mongod --dbpath=data --port=27017 --bind_ip=127.0.0.1 &
MONGO_PID=$!
echo $MONGO_PID > ../mongo.pid
cd ..
sleep 3

echo "[2/5] Installing Backend Dependencies..."
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -q -r requirements.txt
cd ..

echo "[3/5] Installing Frontend Dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    yarn install
fi
cd ..

echo "[4/5] Starting Backend Server..."
cd backend
source venv/bin/activate
python server.py &
BACKEND_PID=$!
echo $BACKEND_PID > ../backend.pid
cd ..
sleep 5

echo "[5/5] Starting Frontend..."
cd frontend
yarn start &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../frontend.pid
cd ..

echo ""
echo "Waiting for services..."
sleep 10

# Open browser
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
elif command -v open &> /dev/null; then
    open http://localhost:3000
fi

echo ""
echo "========================================"
echo "✓ Application Started!"
echo "========================================"
echo ""
echo "Access at: http://localhost:3000"
echo ""
echo "To STOP: Run ./STOP_PORTABLE.sh"
echo ""

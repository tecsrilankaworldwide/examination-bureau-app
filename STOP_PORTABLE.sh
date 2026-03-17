#!/bin/bash
echo "Stopping Grade 5 Scholarship Exam Platform (Portable)..."

# Stop frontend
if [ -f frontend.pid ]; then
    kill $(cat frontend.pid) 2>/dev/null
    rm frontend.pid
fi

# Stop backend
if [ -f backend.pid ]; then
    kill $(cat backend.pid) 2>/dev/null
    rm backend.pid
fi

# Stop MongoDB
if [ -f mongo.pid ]; then
    kill $(cat mongo.pid) 2>/dev/null
    rm mongo.pid
fi

# Fallback: kill by process name
pkill -f "python server.py" 2>/dev/null
pkill -f "yarn start" 2>/dev/null
pkill -f "mongod" 2>/dev/null

echo ""
echo "✓ Application stopped!"

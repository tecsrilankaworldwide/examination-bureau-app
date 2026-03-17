#!/bin/bash
# Stop Grade 5 Scholarship Exam Platform

echo "Stopping Grade 5 Scholarship Exam Platform..."
docker-compose -f docker-compose.production.yml down

echo ""
echo "✓ Application stopped successfully!"
echo ""

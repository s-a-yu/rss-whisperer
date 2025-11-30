#!/bin/bash

# RSS Whisperer - Startup Script
# This script starts both the backend API and frontend development server

echo "🎙️  RSS Whisperer - Starting Services"
echo "======================================"

# Check if node_modules exist
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

# Start backend in background
echo ""
echo "🚀 Starting backend API server on http://localhost:3001"
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 2

# Start frontend in background
echo "🚀 Starting frontend dev server on http://localhost:5173"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Services started successfully!"
echo ""
echo "📍 Backend API:  http://localhost:3001"
echo "📍 Frontend UI:  http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Function to handle shutdown
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Trap Ctrl+C
trap cleanup INT TERM

# Wait for processes
wait

#!/bin/bash

echo "🚀 Starting RelayPoint..."

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first:"
    echo "   mongod"
    exit 1
fi

# Check if .env files exist
if [ ! -f "server/.env" ]; then
    echo "⚠️  Server .env file not found. Copying from example..."
    cp server/env.example server/.env
    echo "📝 Please edit server/.env with your configuration"
fi

if [ ! -f "client/.env" ]; then
    echo "⚠️  Client .env file not found. Copying from example..."
    cp client/env.example client/.env
fi

# Install dependencies if node_modules don't exist
if [ ! -d "server/node_modules" ]; then
    echo "📦 Installing server dependencies..."
    cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing client dependencies..."
    cd client && npm install && cd ..
fi

echo "✅ Dependencies installed"

# Start the server in background
echo "🖥️  Starting server..."
cd server && npm run dev &
SERVER_PID=$!

# Wait a moment for server to start
sleep 3

# Start the client
echo "🌐 Starting client..."
cd ../client && npm run dev &
CLIENT_PID=$!

echo ""
echo "🎉 RelayPoint is starting up!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping RelayPoint..."
    kill $SERVER_PID 2>/dev/null
    kill $CLIENT_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for processes
wait

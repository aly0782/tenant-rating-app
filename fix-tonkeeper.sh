#!/bin/bash

echo "🔧 Fixing Tonkeeper Connection"
echo "=============================="

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "📦 Installing ngrok for temporary tunnel..."
    npm install -g ngrok
fi

echo ""
echo "📱 Starting local development server..."
echo ""

# Start the dev server in background
cd src/dapp
yarn dev &
DEV_PID=$!

echo "Waiting for server to start..."
sleep 5

echo ""
echo "🌐 Creating public tunnel..."
echo ""

# Create ngrok tunnel
ngrok http 5173 &
NGROK_PID=$!

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Visit http://localhost:4040 to see your public URL"
echo "2. Update src/dapp/public/tonconnect-manifest.json with the ngrok URL"
echo "3. Try connecting Tonkeeper again"
echo ""
echo "Press Ctrl+C to stop the tunnel and server"

# Wait for interrupt
trap "kill $DEV_PID $NGROK_PID; exit" INT
wait
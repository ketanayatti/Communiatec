#!/bin/bash

# Quick Server Recovery Script
echo "🚀 Attempting Server Recovery..."

APP_DIR="$HOME/Communiatec"
cd "$APP_DIR"

# 1. Kill any zombie processes
echo "1️⃣ Cleaning up zombie processes..."
pkill -9 node 2>/dev/null || echo "  No node processes to kill"
sleep 2

# 2. Ensure Server directory exists
if [ ! -d "Server" ]; then
    echo "❌ Server directory not found!"
    exit 1
fi

cd Server

# 3. Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --production
fi

# 4. Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found in Server directory"
    echo "   Please ensure your environment variables are configured"
fi

# 5. Start/Restart the server
echo "2️⃣ Starting server with PM2..."
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=1024"

# First, try to restart
pm2 restart communiatec-server 2>/dev/null || {
    echo "3️⃣ Server not running, starting fresh..."
    pm2 start server.js --name "communiatec-server" --env NODE_ENV=production --env NODE_OPTIONS="--max-old-space-size=1024"
}

# 6. Save PM2 config
pm2 save

# 7. Setup PM2 to start on boot
echo "4️⃣ Setting up PM2 to auto-start..."
pm2 startup || echo "  (requires sudo, may need manual setup)"

# 8. Wait a moment for server to start
echo "5️⃣ Waiting for server to initialize..."
sleep 3

# 9. Check status
echo "6️⃣ Final status:"
pm2 status

# 10. Test connection
echo -e "\n7️⃣ Testing server connection..."
curl -s http://localhost:4000/api/maintenance/status && echo "✅ Server is responding!" || echo "⚠️  Server not responding yet, may take a moment to fully start"

echo -e "\n✅ Recovery complete"

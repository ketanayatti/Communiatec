#!/bin/bash

# Update Script for Communiatec
# Run this script on your EC2 instance to pull changes and redeploy.

APP_DIR="$HOME/Communiatec"

set -e

echo "🚀 Starting Application Update..."

if [ ! -d "$APP_DIR" ]; then
  echo "❌ Error: Application directory $APP_DIR not found."
  exit 1
fi

cd "$APP_DIR"

# 1. Pull latest changes
echo "📥 Pulling latest changes from Git..."
git pull origin master

# 2. Update Server
echo "🛠️ Updating Server..."
cd Server

# Ensure .env file exists with critical configuration
if [ ! -f ".env" ]; then
    echo "⚠️  .env file missing in Server, creating with defaults..."
    cat > .env << 'ENVEOF'
PORT=4000
NODE_ENV=production
REDIS_URL=disabled
ALLOW_VERCEL_PREVIEWS=true
ENVEOF
    echo "   ⚠️  IMPORTANT: Update .env with your database and service credentials!"
fi

# Ensure PORT is set to 4000 for production
if grep -q "^PORT=" .env; then
    sed -i 's/^PORT=.*/PORT=4000/' .env
else
    echo "PORT=4000" >> .env
fi

npm install
# Restart PM2 process with environment variables
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=512"
pm2 restart communiatec-server || pm2 start server.js --name "communiatec-server" --env NODE_ENV=production

echo "   Waiting for server to stabilize..."
sleep 3

cd ..

# 3. Update Client (only build if package.json or source files changed)
echo "🎨 Updating Client..."
cd Client

# Check if package.json changed
if git diff HEAD~1 HEAD --name-only | grep -q "Client/package.json"; then
    echo "package.json changed, installing dependencies..."
    npm install
else
    echo "Skipping npm install (no package.json changes)"
fi

# Check if client source files changed
if git diff HEAD~1 HEAD --name-only | grep -q "Client/src/\|Client/public/"; then
    echo "🏗️ Client source files changed, rebuilding..."
    export NODE_OPTIONS="--max-old-space-size=10240"
    npm run build -- --minify=esbuild --logLevel=info
    unset NODE_OPTIONS
else
    echo "✓ Skipping client build (no source changes detected)"
fi

cd ..

echo "✅ Update Complete! Application should be live."

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

# Get the last deployed commit hash
LAST_DEPLOY_FILE=".last-deploy-commit"
if [ -f "$LAST_DEPLOY_FILE" ]; then
    LAST_COMMIT=$(cat "$LAST_DEPLOY_FILE")
    echo "🔍 Checking changes since $LAST_COMMIT..."
else
    echo "⚠️  No previous deployment record found. Assuming full update."
    LAST_COMMIT="HEAD~1"
fi

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

# Check if Server package.json changed
if git diff "$LAST_COMMIT" HEAD --name-only | grep -q "Server/package.json"; then
    echo "📦 Server package.json changed, installing dependencies..."
    npm install --production --no-audit --prefer-offline
else
    echo "✓ Skipping Server npm install (no package.json changes)"
fi

# Restart PM2 process with environment variables
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=1024"
# Use --update-env to ensure new PORT/env vars are picked up
pm2 restart communiatec-server --update-env || pm2 start server.js --name "communiatec-server" --env NODE_ENV=production

echo "   Waiting for server to stabilize..."
sleep 3

cd ..

# 3. Update Client (only build if package.json or source files changed)
echo "🎨 Updating Client..."
cd Client

# Check if Client package.json changed
if git diff "$LAST_COMMIT" HEAD --name-only | grep -q "Client/package.json"; then
    echo "📦 Client package.json changed, installing dependencies..."
    npm install --no-audit --prefer-offline
else
    echo "✓ Skipping Client npm install (no package.json changes)"
fi

# Check if client source files changed
if git diff "$LAST_COMMIT" HEAD --name-only | grep -q "Client/src/\|Client/public/\|Client/vite.config.js\|Client/index.html"; then
    echo "🏗️ Client source files changed, rebuilding..."
    export NODE_OPTIONS="--max-old-space-size=7168"
    npm run build -- --minify=esbuild --logLevel=info
    unset NODE_OPTIONS
else
    echo "✓ Skipping client build (no source changes detected)"
fi

cd ..

# Save the current commit hash for next time
git rev-parse HEAD > "$LAST_DEPLOY_FILE"

echo "✅ Update Complete! Application should be live."

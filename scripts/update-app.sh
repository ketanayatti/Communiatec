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
npm install
# Restart PM2 process
pm2 restart communiatec-server || pm2 start server.js --name "communiatec-server"
cd ..

# 3. Update Client
echo "🎨 Updating Client..."
cd Client
npm install
echo "🏗️ Building Client..."
# Increase Node.js heap size to 10GB for faster build process
export NODE_OPTIONS="--max-old-space-size=10240"
npm run build -- --minify=esbuild --logLevel=info
unset NODE_OPTIONS

echo "✅ Update Complete! Application should be live."

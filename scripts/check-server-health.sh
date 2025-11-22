#!/bin/bash

# Server Health Check Script
echo "🔍 Checking Server Health on EC2..."
echo "=================================="

APP_DIR="$HOME/Communiatec"

# Check if PM2 is running
echo "1️⃣ Checking PM2 status..."
pm2 status || echo "❌ PM2 not available"

# Check server process
echo -e "\n2️⃣ Checking communiatec-server process..."
pm2 info communiatec-server || echo "❌ Server not in PM2"

# Check if server is listening
echo -e "\n3️⃣ Checking if server is listening on port 4000..."
netstat -tulpn 2>/dev/null | grep -i listen | grep -i "4000\|:4000" || echo "❌ Port 4000 not found"

# Check server logs
echo -e "\n4️⃣ Last 20 lines of server logs..."
pm2 logs communiatec-server --lines 20 --nostream || tail -20 "$APP_DIR/Server/logs/*.log" 2>/dev/null || echo "❌ Cannot read logs"

# Check nginx
echo -e "\n5️⃣ Checking Nginx status..."
sudo systemctl status nginx --no-pager || echo "❌ Nginx not running"

# Test local connection
echo -e "\n6️⃣ Testing local server connection..."
curl -s http://localhost:4000/api/maintenance/status || echo "❌ Cannot connect to local server"

# Check environment variables
echo -e "\n7️⃣ Checking server environment..."
ps aux | grep "server.js" | grep -v grep || echo "❌ server.js not running"

# Check disk space
echo -e "\n8️⃣ Checking disk space..."
df -h | grep -E "Filesystem|/dev/"

# Check memory
echo -e "\n9️⃣ Checking memory usage..."
free -h

echo -e "\n=================================="
echo "✅ Health check complete"

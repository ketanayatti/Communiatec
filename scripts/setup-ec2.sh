#!/bin/bash

# Setup Script for Communiatec on AWS EC2 (Ubuntu 24.04)
# Run this script on your EC2 instance to install all dependencies.

set -e # Exit on error

echo "🚀 Starting EC2 Setup for Communiatec..."

# 1. Update System
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js (v20)
echo "🟢 Installing Node.js v20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Install Nginx
echo "🌐 Installing Nginx..."
sudo apt install -y nginx

# 4. Install Git
echo "🔧 Installing Git..."
sudo apt install -y git

# 5. Install PM2
echo "⚙️ Installing PM2..."
sudo npm install -g pm2

# 6. Verify Installations
echo "✅ Verifying installations..."
node -v
npm -v
nginx -v
pm2 -v

echo "🎉 Setup Complete! You can now clone your repository and deploy."
echo "   Run: git clone https://github.com/ketanayatti/Communiatec.git"

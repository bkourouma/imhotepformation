#!/bin/bash

# Quick fix for production mode issues

echo "🔧 Fixing production mode..."

# Navigate to app directory
cd /var/www/formations-app

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build the application
npm run build

# Stop existing process
pm2 delete formations-app 2>/dev/null || true

# Start with production environment
NODE_ENV=production pm2 start server/server.js --name "formations-app"

# Save PM2 configuration
pm2 save

echo "✅ Production mode fixed!"
echo "Check logs: pm2 logs formations-app --lines 10" 
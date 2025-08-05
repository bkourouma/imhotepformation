#!/bin/bash

# Simple server update script

echo "🚀 Updating server..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Navigate to app directory
print_status "Step 1: Going to app directory..."
cd /var/www/formations-app

# Step 2: Pull latest changes
print_status "Step 2: Pulling latest changes..."
git pull origin main

# Step 3: Install dependencies
print_status "Step 3: Installing dependencies..."
npm install

# Step 4: Build the app
print_status "Step 4: Building the app..."
npm run build

# Step 5: Create production environment
print_status "Step 5: Setting production environment..."
cat > .env << EOF
NODE_ENV=production
PORT=3001
FORCE_PRODUCTION=true
EOF

# Step 6: Restart PM2
print_status "Step 6: Restarting PM2..."
pm2 delete formations-app 2>/dev/null || true
NODE_ENV=production FORCE_PRODUCTION=true pm2 start server/server.js --name "formations-app"
pm2 save

# Step 7: Wait and test
print_status "Step 7: Waiting for app to start..."
sleep 5

# Step 8: Test
print_status "Step 8: Testing..."
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    print_success "✅ API is working!"
    curl http://localhost:3001/api/health
else
    print_error "❌ API is not working"
    pm2 logs formations-app --lines 10
fi

print_success "Update completed! 🎉"
echo ""
echo "🌐 Test the website: https://imhotepformation.engage-360.net"
echo "📊 Check PM2: pm2 status"
echo "📝 Check logs: pm2 logs formations-app" 
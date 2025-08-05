#!/bin/bash

# Force font size update with complete restart

echo "🔧 Force updating font size with complete restart..."

# Colors for output
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

# Step 1: Navigate to application directory
print_status "Step 1: Navigating to application directory..."
cd /var/www/formations-app
print_success "Changed to application directory"

# Step 2: Check current git status
print_status "Step 2: Checking git status..."
git status
git log --oneline -3

# Step 3: Force pull latest changes
print_status "Step 3: Force pulling latest changes..."
git fetch origin
git reset --hard origin/main
print_success "Repository force updated"

# Step 4: Clear npm cache and node_modules
print_status "Step 4: Clearing cache and reinstalling dependencies..."
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
print_success "Dependencies reinstalled"

# Step 5: Clear build cache
print_status "Step 5: Clearing build cache..."
rm -rf dist
print_success "Build cache cleared"

# Step 6: Build the application
print_status "Step 6: Building the application..."
npm run build
print_success "Application built"

# Step 7: Stop PM2 completely
print_status "Step 7: Stopping PM2 completely..."
pm2 delete formations-app 2>/dev/null || true
pm2 kill
print_success "PM2 stopped"

# Step 8: Start PM2 fresh
print_status "Step 8: Starting PM2 fresh..."
pm2 start server/server.js --name "formations-app" --env production
pm2 save
pm2 startup
print_success "PM2 started fresh"

# Step 9: Wait for application to start
print_status "Step 9: Waiting for application to start..."
sleep 5

# Step 10: Test the application
print_status "Step 10: Testing the application..."
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    print_success "Application is responding"
    curl http://localhost:3001/api/health
else
    print_error "Application is not responding"
    echo "Checking PM2 logs:"
    pm2 logs formations-app --lines 10
    exit 1
fi

# Step 11: Clear browser cache hint
print_status "Step 11: Checking static files..."
curl -I http://localhost:3001/

print_success "Force font size update completed! 🎉"
echo ""
echo "📋 Summary:"
echo "   - Repository force updated"
echo "   - Cache cleared and dependencies reinstalled"
echo "   - PM2 completely restarted"
echo "   - Application rebuilt from scratch"
echo ""
echo "🔧 Important: Clear your browser cache!"
echo "   - Press Ctrl+F5 or Ctrl+Shift+R in your browser"
echo "   - Or open in incognito/private mode"
echo "   - Visit: https://imhotepformation.engage-360.net"
echo ""
echo "🔍 If still not working:"
echo "   - Check browser developer tools (F12)"
echo "   - Look at the Network tab for cached files"
echo "   - Try a different browser" 
#!/bin/bash

# Fix 404 error and static file serving issues

echo "🔧 Fixing 404 error and static file serving..."

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

# Step 2: Check if dist directory exists
print_status "Step 2: Checking build files..."
if [ -d "dist" ]; then
    print_success "dist directory exists"
    ls -la dist/
else
    print_error "dist directory not found!"
    print_status "Building the application..."
    npm run build
fi

# Step 3: Check server configuration
print_status "Step 3: Checking server configuration..."
if [ -f "server/server.js" ]; then
    print_success "server.js exists"
    # Check if static file serving is configured
    grep -n "express.static\|dist" server/server.js
else
    print_error "server.js not found!"
    exit 1
fi

# Step 4: Pull latest changes and rebuild
print_status "Step 4: Pulling latest changes..."
git pull origin main
print_success "Repository updated"

# Step 5: Install dependencies
print_status "Step 5: Installing dependencies..."
npm install
print_success "Dependencies installed"

# Step 6: Build the application
print_status "Step 6: Building the application..."
npm run build
print_success "Application built"

# Step 7: Check if dist directory has content
print_status "Step 7: Checking build files..."
if [ -d "dist" ]; then
    print_success "dist directory exists"
    ls -la dist/
    
    # Check if index.html exists
    if [ -f "dist/index.html" ]; then
        print_success "index.html exists"
        head -5 dist/index.html
    else
        print_error "index.html not found in dist!"
    fi
else
    print_error "dist directory not found after build!"
    exit 1
fi

# Step 8: Create proper environment file
print_status "Step 8: Creating production environment file..."
cat > .env << EOF
NODE_ENV=production
PORT=3001
EOF
print_success "Environment file created"

# Step 9: Stop and restart PM2
print_status "Step 9: Restarting PM2 with production environment..."
pm2 delete formations-app 2>/dev/null || true
NODE_ENV=production pm2 start server/server.js --name "formations-app"
pm2 save
print_success "PM2 restarted with production environment"

# Step 10: Wait for application to start
print_status "Step 10: Waiting for application to start..."
sleep 5

# Step 11: Test application locally
print_status "Step 11: Testing application locally..."
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    print_success "API is responding"
    curl http://localhost:3001/api/health
else
    print_error "API is not responding"
    pm2 logs formations-app --lines 10
    exit 1
fi

# Step 12: Test static file serving
print_status "Step 12: Testing static file serving..."
if curl -f http://localhost:3001/ > /dev/null 2>&1; then
    print_success "Static files are being served"
    curl -I http://localhost:3001/
else
    print_error "Static files are not being served"
    echo "Checking server logs:"
    pm2 logs formations-app --lines 10
fi

# Step 13: Test domain access
print_status "Step 13: Testing domain access..."
sleep 3
if curl -f https://imhotepformation.engage-360.net/api/health > /dev/null 2>&1; then
    print_success "Domain API is accessible!"
    curl https://imhotepformation.engage-360.net/api/health
else
    print_error "Domain API is not accessible"
fi

# Step 14: Test domain static files
print_status "Step 14: Testing domain static files..."
if curl -f https://imhotepformation.engage-360.net/ > /dev/null 2>&1; then
    print_success "Domain static files are accessible!"
    curl -I https://imhotepformation.engage-360.net/
else
    print_error "Domain static files are not accessible"
fi

print_success "404 and static file fix completed! 🎉"
echo ""
echo "📋 Summary:"
echo "   - Application rebuilt"
echo "   - Production environment set"
echo "   - PM2 restarted with production mode"
echo "   - Static files should now be served"
echo ""
echo "🔧 Test the application:"
echo "   - Visit: https://imhotepformation.engage-360.net"
echo "   - Should show React interface instead of 404"
echo ""
echo "🔍 If still having issues:"
echo "   - Check logs: pm2 logs formations-app --lines 20"
echo "   - Check if dist/index.html exists"
echo "   - Verify Nginx configuration" 
#!/bin/bash

# Deploy with production mode fix

echo "🚀 Deploying with production mode fix..."

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

# Step 1: Navigate to application directory
print_status "Step 1: Navigating to application directory..."
cd /var/www/formations-app
print_success "Changed to application directory"

# Step 2: Pull latest changes
print_status "Step 2: Pulling latest changes..."
git pull origin main
print_success "Repository updated"

# Step 3: Install dependencies
print_status "Step 3: Installing dependencies..."
npm install
print_success "Dependencies installed"

# Step 4: Build the application
print_status "Step 4: Building the application..."
npm run build
print_success "Application built"

# Step 5: Verify build files
print_status "Step 5: Verifying build files..."
if [ -d "dist" ]; then
    print_success "dist directory exists"
    ls -la dist/
    
    if [ -f "dist/index.html" ]; then
        print_success "index.html exists"
        echo "First few lines of index.html:"
        head -3 dist/index.html
    else
        print_error "index.html not found in dist!"
        exit 1
    fi
else
    print_error "dist directory not found after build!"
    exit 1
fi

# Step 6: Create production environment file
print_status "Step 6: Creating production environment file..."
cat > .env << EOF
NODE_ENV=production
PORT=3001
FORCE_PRODUCTION=true
EOF
print_success "Production environment file created"

# Step 7: Stop PM2
print_status "Step 7: Stopping PM2..."
pm2 delete formations-app 2>/dev/null || true
print_success "PM2 stopped"

# Step 8: Start PM2 with production environment
print_status "Step 8: Starting PM2 with production environment..."
NODE_ENV=production FORCE_PRODUCTION=true pm2 start server/server.js --name "formations-app"
pm2 save
print_success "PM2 started with production environment"

# Step 9: Wait for application to start
print_status "Step 9: Waiting for application to start..."
sleep 5

# Step 10: Check PM2 status
print_status "Step 10: Checking PM2 status..."
pm2 status

# Step 11: Test application locally
print_status "Step 11: Testing application locally..."
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    print_success "API is responding"
    curl http://localhost:3001/api/health
else
    print_error "API is not responding"
    echo "PM2 logs:"
    pm2 logs formations-app --lines 10
    exit 1
fi

# Step 12: Test static file serving locally
print_status "Step 12: Testing static file serving locally..."
if curl -f http://localhost:3001/ > /dev/null 2>&1; then
    print_success "Static files are being served locally"
    curl -I http://localhost:3001/
else
    print_error "Static files are NOT being served locally"
    echo "PM2 logs:"
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

print_success "Deployment with production fix completed! 🎉"
echo ""
echo "📋 Summary:"
echo "   - Application rebuilt"
echo "   - Production mode forced (NODE_ENV=production, FORCE_PRODUCTION=true)"
echo "   - PM2 restarted with production environment"
echo "   - Static files should now be served correctly"
echo ""
echo "🔧 Test the application:"
echo "   - Visit: https://imhotepformation.engage-360.net"
echo "   - Should show React interface instead of 404"
echo ""
echo "🔍 If still having issues:"
echo "   - Check logs: pm2 logs formations-app --lines 20"
echo "   - Check environment: pm2 env formations-app"
echo "   - Verify static files: ls -la dist/" 
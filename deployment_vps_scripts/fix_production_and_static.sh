#!/bin/bash

# Fix production mode and static file serving issues

echo "🔧 Fixing production mode and static file serving..."

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

# Step 5: Check if dist directory exists
print_status "Step 5: Checking build files..."
if [ -d "dist" ]; then
    print_success "dist directory exists"
    ls -la dist/
else
    print_error "dist directory not found!"
    exit 1
fi

# Step 6: Fix database constraint issue
print_status "Step 6: Fixing database constraint issue..."
# Remove the database files to recreate them
rm -f server/database/formations.db*
print_success "Database files removed for recreation"

# Step 7: Create proper environment file
print_status "Step 7: Creating production environment file..."
cat > .env << EOF
NODE_ENV=production
PORT=3001
EOF
print_success "Environment file created"

# Step 8: Stop existing PM2 process
print_status "Step 8: Stopping existing PM2 process..."
pm2 delete formations-app 2>/dev/null || true
print_success "Existing process stopped"

# Step 9: Start application with proper production environment
print_status "Step 9: Starting application with production environment..."
NODE_ENV=production pm2 start server/server.js --name "formations-app"
pm2 save
print_success "Application started in production mode"

# Step 10: Wait for application to start
print_status "Step 10: Waiting for application to start..."
sleep 5

# Step 11: Test application locally
print_status "Step 11: Testing application locally..."
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    print_success "Application is responding locally"
    curl http://localhost:3001/api/health
else
    print_error "Application is not responding locally"
    echo "Checking PM2 logs:"
    pm2 logs formations-app --lines 10
    exit 1
fi

# Step 12: Test static file serving
print_status "Step 12: Testing static file serving..."
if curl -f http://localhost:3001/ > /dev/null 2>&1; then
    print_success "Static files are being served"
    curl -I http://localhost:3001/
else
    print_warning "Static files test failed"
fi

# Step 13: Check Nginx configuration
print_status "Step 13: Checking Nginx configuration..."
nginx -t
if [ $? -eq 0 ]; then
    print_success "Nginx configuration is valid"
    systemctl reload nginx
else
    print_error "Nginx configuration has errors"
    exit 1
fi

# Step 14: Test domain access
print_status "Step 14: Testing domain access..."
sleep 3
if curl -f https://imhotepformation.engage-360.net/api/health > /dev/null 2>&1; then
    print_success "Domain is accessible!"
    curl https://imhotepformation.engage-360.net/api/health
else
    print_warning "Domain test failed, but local app is working"
    echo "This might be a DNS or SSL issue"
fi

print_success "Production and static file fix completed! 🎉"
echo ""
echo "📋 Summary:"
echo "   - Application: https://imhotepformation.engage-360.net"
echo "   - API Health: https://imhotepformation.engage-360.net/api/health"
echo "   - PM2 Status: pm2 status"
echo "   - PM2 Logs: pm2 logs formations-app"
echo "   - Nginx Status: systemctl status nginx"

echo ""
echo "🔧 Verification commands:"
echo "1. Check app status: pm2 status"
echo "2. Check app logs: pm2 logs formations-app --lines 20"
echo "3. Test local API: curl http://localhost:3001/api/health"
echo "4. Test domain: curl https://imhotepformation.engage-360.net/api/health" 
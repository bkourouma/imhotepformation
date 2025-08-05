#!/bin/bash

# Fix routing issues

echo "🔧 Fixing routing configuration..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
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

# Step 5: Restart the application
print_status "Step 5: Restarting the application..."
pm2 restart formations-app
print_success "Application restarted"

# Step 6: Test the application
print_status "Step 6: Testing the application..."
sleep 3
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    print_success "Application is working correctly!"
    echo "🌐 Your application is available at: https://imhotepformation.engage-360.net"
else
    echo "⚠️  Application health check failed. Please check the logs:"
    pm2 logs formations-app --lines 10
fi

print_success "Routing fix completed! 🎉"
echo ""
echo "📋 Summary:"
echo "   - Application: https://imhotepformation.engage-360.net"
echo "   - API Health: https://imhotepformation.engage-360.net/api/health"
echo "   - PM2 Status: pm2 status"
echo "   - PM2 Logs: pm2 logs formations-app"
echo "   - Nginx Status: systemctl status nginx"

echo ""
echo "🔧 Troubleshooting:"
echo "1. Check the application logs: pm2 logs formations-app"
echo "2. Check Nginx logs: tail -f /var/log/nginx/error.log"
echo "3. Check Nginx configuration: nginx -t" 
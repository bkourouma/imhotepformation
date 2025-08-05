#!/bin/bash

# Fix 502 Bad Gateway error

echo "🔧 Fixing 502 Bad Gateway error..."

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

# Step 1: Check PM2 status
print_status "Step 1: Checking PM2 status..."
pm2 status

# Step 2: Check if port 3001 is listening
print_status "Step 2: Checking if port 3001 is listening..."
netstat -tulpn | grep 3001

# Step 3: Check application logs
print_status "Step 3: Checking application logs..."
pm2 logs formations-app --lines 20

# Step 4: Test local application
print_status "Step 4: Testing local application..."
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    print_success "Application is responding locally"
    curl http://localhost:3001/api/health
else
    print_error "Application is NOT responding locally"
    
    # Step 5: Restart the application
    print_status "Step 5: Restarting the application..."
    pm2 delete formations-app 2>/dev/null || true
    cd /var/www/formations-app
    pm2 start server/server.js --name "formations-app" --env production
    pm2 save
    
    # Step 6: Wait and test again
    print_status "Step 6: Waiting for application to start..."
    sleep 5
    
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        print_success "Application is now responding"
        curl http://localhost:3001/api/health
    else
        print_error "Application still not responding"
        echo "Checking detailed logs:"
        pm2 logs formations-app --lines 30
        exit 1
    fi
fi

# Step 7: Check Nginx configuration
print_status "Step 7: Checking Nginx configuration..."
nginx -t

# Step 8: Reload Nginx
print_status "Step 8: Reloading Nginx..."
systemctl reload nginx

# Step 9: Test domain access
print_status "Step 9: Testing domain access..."
sleep 3
if curl -f https://imhotepformation.engage-360.net/api/health > /dev/null 2>&1; then
    print_success "Domain is accessible!"
    curl https://imhotepformation.engage-360.net/api/health
else
    print_warning "Domain test failed, but local app is working"
    echo "This might be a DNS or SSL issue"
fi

print_success "502 error fix completed! 🎉"
echo ""
echo "📋 Summary:"
echo "   - PM2 status checked"
echo "   - Application restarted if needed"
echo "   - Nginx configuration verified"
echo "   - Domain access tested"
echo ""
echo "🔧 If still getting 502:"
echo "   - Check PM2 logs: pm2 logs formations-app --lines 50"
echo "   - Check Nginx logs: tail -f /var/log/nginx/error.log"
echo "   - Check if port 3001 is free: netstat -tulpn | grep 3001" 
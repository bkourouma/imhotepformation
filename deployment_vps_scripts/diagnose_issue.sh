#!/bin/bash

# Diagnostic script for imhotepformation.engage-360.net issues

echo "🔍 Diagnosing application issues..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Check if application directory exists
print_status "Step 1: Checking application directory..."
if [ -d "/var/www/formations-app" ]; then
    print_success "Application directory exists"
    cd /var/www/formations-app
    ls -la
else
    print_error "Application directory does not exist!"
    echo "Creating application directory..."
    mkdir -p /var/www/formations-app
    cd /var/www/formations-app
fi

# Step 2: Check if repository is cloned
print_status "Step 2: Checking repository..."
if [ -d ".git" ]; then
    print_success "Repository exists"
    git status
    git log --oneline -5
else
    print_warning "Repository not found, cloning..."
    git clone https://github.com/bkourouma/imhotepformation.git .
fi

# Step 3: Check PM2 status
print_status "Step 3: Checking PM2 status..."
pm2 status

# Step 4: Check if application is running
print_status "Step 4: Checking application health..."
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    print_success "Application is responding on localhost:3001"
    curl http://localhost:3001/api/health
else
    print_error "Application is not responding on localhost:3001"
fi

# Step 5: Check Nginx status
print_status "Step 5: Checking Nginx status..."
systemctl status nginx --no-pager -l

# Step 6: Check Nginx configuration
print_status "Step 6: Checking Nginx configuration..."
nginx -t

# Step 7: Check Nginx sites
print_status "Step 7: Checking Nginx sites..."
ls -la /etc/nginx/sites-available/
ls -la /etc/nginx/sites-enabled/

# Step 8: Check SSL certificate
print_status "Step 8: Checking SSL certificate..."
certbot certificates

# Step 9: Check domain resolution
print_status "Step 9: Checking domain resolution..."
nslookup imhotepformation.engage-360.net

# Step 10: Check if port 3001 is listening
print_status "Step 10: Checking if port 3001 is listening..."
netstat -tulpn | grep 3001

# Step 11: Check application logs
print_status "Step 11: Checking application logs..."
if pm2 list | grep formations-app > /dev/null; then
    echo "Last 20 lines of PM2 logs:"
    pm2 logs formations-app --lines 20
else
    print_warning "PM2 process 'formations-app' not found"
fi

# Step 12: Check Nginx logs
print_status "Step 12: Checking Nginx logs..."
echo "Last 10 lines of Nginx error log:"
tail -10 /var/log/nginx/error.log

echo ""
print_status "Diagnostic completed!"
echo ""
echo "📋 Summary of issues found:"
echo "1. Check if PM2 process is running"
echo "2. Check if application is built (dist/ directory)"
echo "3. Check if Nginx is properly configured"
echo "4. Check if SSL certificate is valid"
echo ""
echo "🔧 Next steps:"
echo "1. If PM2 is not running: pm2 start server/server.js --name formations-app"
echo "2. If app is not built: npm run build"
echo "3. If Nginx has issues: nginx -t && systemctl reload nginx"
echo "4. If SSL has issues: certbot --nginx -d imhotepformation.engage-360.net" 
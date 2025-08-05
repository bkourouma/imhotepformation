#!/bin/bash

# Verification Script for FDFP-CGECI/ ASPCI Deployment
# Run this after deployment to verify everything is working

echo "🔍 Verifying deployment..."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to check status
check_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Check PM2 process
echo "🔍 Checking PM2 process..."
if pm2 status | grep formations-app > /dev/null; then
    echo "✅ PM2 process is running"
    pm2 status | grep formations-app
else
    echo "❌ PM2 process is not running"
fi

# Check application health
echo "🔍 Checking application health..."
if curl -f https://imhotepformation.engage-360.net/api/health > /dev/null 2>&1; then
    echo "✅ Application is responding"
else
    echo "❌ Application is not responding"
fi

# Check Nginx status
echo "Checking Nginx status..."
systemctl is-active --quiet nginx
check_status $? "Nginx is running"

# Check SSL certificate
echo "🔍 Checking SSL certificate..."
if certbot certificates | grep imhotepformation.engage-360.net > /dev/null; then
    echo "✅ SSL certificate is configured"
else
    echo "❌ SSL certificate is not configured"
fi

# Check if domain is accessible (if DNS is configured)
echo "Checking domain accessibility..."
curl -f https://imhotepformation.engage-360.net/api/health > /dev/null 2>&1
check_status $? "Domain is accessible via HTTPS"

# Show useful information
echo ""
echo "📊 Current Status:"
echo "=================="
pm2 status
echo ""
echo "🌐 Application URLs:"
echo "   - Main App: https://imhotepformation.engage-360.net"
echo "   - API Health: https://imhotepformation.engage-360.net/api/health"
echo ""
echo "📋 Useful Commands:"
echo "   - View logs: pm2 logs formations-app"
echo "   - Restart app: pm2 restart formations-app"
echo "   - Check Nginx: systemctl status nginx"
echo "   - Check SSL: certbot certificates" 

echo "📋 Summary:"
echo "   - Main App: https://imhotepformation.engage-360.net"
echo "   - API Health: https://imhotepformation.engage-360.net/api/health"
echo "   - View logs: pm2 logs formations-app"
echo "   - Restart app: pm2 restart formations-app" 
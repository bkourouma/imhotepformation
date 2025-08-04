#!/bin/bash

# Verification Script for Formations App Deployment
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

# Check if PM2 is running
echo "Checking PM2 status..."
pm2 status | grep formations-app > /dev/null
check_status $? "PM2 application is running"

# Check if application is responding
echo "Checking application health..."
curl -f http://localhost:3001/api/health > /dev/null 2>&1
check_status $? "Application health check passed"

# Check Nginx status
echo "Checking Nginx status..."
systemctl is-active --quiet nginx
check_status $? "Nginx is running"

# Check SSL certificate
echo "Checking SSL certificate..."
certbot certificates | grep formations.engage-360.net > /dev/null
check_status $? "SSL certificate is installed"

# Check if domain is accessible (if DNS is configured)
echo "Checking domain accessibility..."
curl -f https://formations.engage-360.net/api/health > /dev/null 2>&1
check_status $? "Domain is accessible via HTTPS"

# Show useful information
echo ""
echo "📊 Current Status:"
echo "=================="
pm2 status
echo ""
echo "🌐 Application URLs:"
echo "   - Main App: https://formations.engage-360.net"
echo "   - API Health: https://formations.engage-360.net/api/health"
echo ""
echo "📋 Useful Commands:"
echo "   - View logs: pm2 logs formations-app"
echo "   - Restart app: pm2 restart formations-app"
echo "   - Check Nginx: systemctl status nginx"
echo "   - Check SSL: certbot certificates" 
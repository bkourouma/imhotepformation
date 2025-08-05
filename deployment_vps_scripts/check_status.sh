#!/bin/bash

# Quick status check for imhotepformation.engage-360.net

echo "🔍 Quick Status Check"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check PM2 status
echo "📊 PM2 Status:"
pm2 status

echo ""

# Check if app is running on port 3001
echo "🌐 Local Application Test:"
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Application is running on localhost:3001${NC}"
    curl -s http://localhost:3001/api/health | head -1
else
    echo -e "${RED}❌ Application is NOT running on localhost:3001${NC}"
fi

echo ""

# Check domain access
echo "🌍 Domain Access Test:"
if curl -f https://imhotepformation.engage-360.net/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Domain is accessible${NC}"
    curl -s https://imhotepformation.engage-360.net/api/health | head -1
else
    echo -e "${RED}❌ Domain is NOT accessible${NC}"
fi

echo ""

# Check Nginx status
echo "🔧 Nginx Status:"
systemctl is-active nginx
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Nginx is running${NC}"
else
    echo -e "${RED}❌ Nginx is NOT running${NC}"
fi

echo ""

# Check SSL certificate
echo "🔒 SSL Certificate:"
certbot certificates | grep imhotepformation.engage-360.net > /dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ SSL certificate exists${NC}"
else
    echo -e "${YELLOW}⚠️  SSL certificate not found${NC}"
fi

echo ""

echo "📋 Quick Commands:"
echo "• View logs: pm2 logs formations-app --lines 20"
echo "• Restart app: pm2 restart formations-app"
echo "• Check Nginx: systemctl status nginx"
echo "• Test domain: curl -I https://imhotepformation.engage-360.net" 
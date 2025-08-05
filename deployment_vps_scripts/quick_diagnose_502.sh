#!/bin/bash

# Quick diagnose for 502 Bad Gateway error

echo "🔍 Quick diagnose for 502 error..."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check PM2 status
echo "📊 PM2 Status:"
pm2 status

echo ""

# Check if port 3001 is listening
echo "🌐 Port 3001 Status:"
if netstat -tulpn | grep 3001 > /dev/null; then
    echo -e "${GREEN}✅ Port 3001 is listening${NC}"
    netstat -tulpn | grep 3001
else
    echo -e "${RED}❌ Port 3001 is NOT listening${NC}"
fi

echo ""

# Check application logs
echo "📋 Last 10 lines of PM2 logs:"
pm2 logs formations-app --lines 10

echo ""

# Test local application
echo "🔧 Local Application Test:"
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Application is responding locally${NC}"
    curl http://localhost:3001/api/health
else
    echo -e "${RED}❌ Application is NOT responding locally${NC}"
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

# Check Nginx configuration
echo "⚙️ Nginx Configuration:"
nginx -t

echo ""

echo "📋 Quick Fix Commands:"
echo "• Restart app: pm2 restart formations-app"
echo "• Check logs: pm2 logs formations-app --lines 20"
echo "• Reload Nginx: systemctl reload nginx"
echo "• Test domain: curl https://imhotepformation.engage-360.net/api/health" 
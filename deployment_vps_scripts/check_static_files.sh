#!/bin/bash

# Check static file serving status

echo "🔍 Checking static file serving status..."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check PM2 status
echo "📊 PM2 Status:"
pm2 status

echo ""

# Check if dist directory exists
echo "📁 Build Files Check:"
if [ -d "dist" ]; then
    echo -e "${GREEN}✅ dist directory exists${NC}"
    ls -la dist/
    
    if [ -f "dist/index.html" ]; then
        echo -e "${GREEN}✅ index.html exists${NC}"
        echo "First few lines of index.html:"
        head -3 dist/index.html
    else
        echo -e "${RED}❌ index.html not found${NC}"
    fi
else
    echo -e "${RED}❌ dist directory not found${NC}"
fi

echo ""

# Check server configuration
echo "⚙️ Server Configuration:"
if [ -f "server/server.js" ]; then
    echo -e "${GREEN}✅ server.js exists${NC}"
    echo "Static file serving configuration:"
    grep -n "express.static\|dist" server/server.js
else
    echo -e "${RED}❌ server.js not found${NC}"
fi

echo ""

# Test local API
echo "🔧 Local API Test:"
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API is responding${NC}"
    curl http://localhost:3001/api/health
else
    echo -e "${RED}❌ API is not responding${NC}"
fi

echo ""

# Test local static files
echo "🌐 Local Static Files Test:"
if curl -f http://localhost:3001/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Static files are being served locally${NC}"
    curl -I http://localhost:3001/
else
    echo -e "${RED}❌ Static files are NOT being served locally${NC}"
fi

echo ""

# Test domain API
echo "🌍 Domain API Test:"
if curl -f https://imhotepformation.engage-360.net/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Domain API is accessible${NC}"
    curl https://imhotepformation.engage-360.net/api/health
else
    echo -e "${RED}❌ Domain API is not accessible${NC}"
fi

echo ""

# Test domain static files
echo "🌍 Domain Static Files Test:"
if curl -f https://imhotepformation.engage-360.net/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Domain static files are accessible${NC}"
    curl -I https://imhotepformation.engage-360.net/
else
    echo -e "${RED}❌ Domain static files are not accessible${NC}"
fi

echo ""

echo "📋 Quick Fix Commands:"
echo "• Rebuild app: npm run build"
echo "• Restart PM2: pm2 restart formations-app"
echo "• Check logs: pm2 logs formations-app --lines 20"
echo "• Test local: curl http://localhost:3001/"
echo "• Test domain: curl https://imhotepformation.engage-360.net/" 
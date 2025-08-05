#!/bin/bash

# 🚨 VPS MULTI-SITES : 5+ applications Nginx en production
# - engage-360.net
# - agents.engage-360.net  
# - chat.engage-360.net
# - imhotepformation.engage-360.net (CURRENT SITE)
# - bmi.engage-360.net
# 
# ⚠️  AVERTISSEMENT : Vérifiez impérativement le contexte avant toute commande
# pour éviter tout impact sur les autres sites.

echo "🚀 Updating imhotepformation.engage-360.net server..."
echo "⚠️  VPS MULTI-SITES - Vérification du contexte..."

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

# Step 1: Verify we're working on the correct site
print_status "Step 1: Verifying correct site context..."
CURRENT_DIR=$(pwd)
if [[ "$CURRENT_DIR" != "/var/www/formations-app" ]]; then
    print_error "❌ Wrong directory! Expected: /var/www/formations-app, Current: $CURRENT_DIR"
    print_error "❌ STOPPING - Wrong site context detected!"
    exit 1
fi

print_status "Step 2: Going to app directory..."
cd /var/www/formations-app

# Step 3: Pull latest changes from GitHub
print_status "Step 3: Pulling latest changes from GitHub..."
print_status "📥 Récupération des modifications (corrections serveur + script sécurisé)..."
git pull origin main
print_success "✅ Modifications récupérées depuis GitHub"

# Show what was updated
print_status "📋 Dernières modifications récupérées :"
git log --oneline -3

# Step 4: Install dependencies
print_status "Step 4: Installing dependencies..."
npm install

# Step 5: Build the app
print_status "Step 5: Building the app..."
npm run build

# Step 6: Create production environment
print_status "Step 6: Setting production environment..."
cat > .env << EOF
NODE_ENV=production
PORT=3001
FORCE_PRODUCTION=true
EOF

# Step 7: Restart PM2 (formations-app only)
print_status "Step 7: Restarting PM2 (formations-app only)..."
print_status "⚠️  Vérification - Ne touche que formations-app, pas les autres sites"
pm2 delete formations-app 2>/dev/null || true
NODE_ENV=production FORCE_PRODUCTION=true pm2 start server/server.js --name "formations-app"
pm2 save

# Step 8: Wait and test
print_status "Step 8: Waiting for app to start..."
sleep 5

# Step 9: Test
print_status "Step 9: Testing..."
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    print_success "✅ API is working!"
    curl http://localhost:3001/api/health
else
    print_error "❌ API is not working"
    pm2 logs formations-app --lines 10
fi

print_success "Update completed! 🎉"
echo ""
echo "✅ SITE SPECIFIC UPDATE - imhotepformation.engage-360.net only"
echo "🌐 Test the website: https://imhotepformation.engage-360.net"
echo "📊 Check PM2: pm2 status"
echo "📝 Check logs: pm2 logs formations-app"
echo ""
echo "⚠️  VPS MULTI-SITES - Other sites unaffected:"
echo "   - engage-360.net"
echo "   - agents.engage-360.net"
echo "   - chat.engage-360.net"
echo "   - bmi.engage-360.net" 
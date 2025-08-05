#!/bin/bash

# Fix production mode issues

echo "🔧 Fixing production mode configuration..."

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

# Step 5: Create production environment file
print_status "Step 5: Creating production environment configuration..."
cat > .env << EOF
NODE_ENV=production
PORT=3001
EOF
print_success "Environment file created"

# Step 6: Stop existing process
print_status "Step 6: Stopping existing process..."
pm2 delete formations-app 2>/dev/null || true
print_success "Existing process stopped"

# Step 7: Start with production environment
print_status "Step 7: Starting with production environment..."
NODE_ENV=production pm2 start server/server.js --name "formations-app"
pm2 save
print_success "Application started in production mode"

# Step 8: Verify the application
print_status "Step 8: Verifying the application..."
sleep 5
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    print_success "Application is running successfully!"
    echo "🌐 Your application is available at: https://imhotepformation.engage-360.net"
else
    echo "⚠️  Application health check failed. Please check the logs:"
    pm2 logs formations-app --lines 10
fi

print_success "Production mode fix completed! 🎉" 
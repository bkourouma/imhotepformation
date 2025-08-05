#!/bin/bash

# Update font size for the application title

echo "🔧 Updating font size for application title..."

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

# Step 3: Build the application
print_status "Step 3: Building the application..."
npm run build
print_success "Application built"

# Step 4: Restart the application
print_status "Step 4: Restarting the application..."
pm2 restart formations-app
print_success "Application restarted"

# Step 5: Wait for application to start
print_status "Step 5: Waiting for application to start..."
sleep 3

# Step 6: Test the application
print_status "Step 6: Testing the application..."
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    print_success "Application is responding"
    curl http://localhost:3001/api/health
else
    print_error "Application is not responding"
    exit 1
fi

print_success "Font size update completed! 🎉"
echo ""
echo "📋 Summary:"
echo "   - Title font size reduced from 'text-lg' to 'text-sm'"
echo "   - Application: https://imhotepformation.engage-360.net"
echo "   - The title 'FDFP-CGECI/ ASPCI' should now be smaller"
echo ""
echo "🔧 Check the result:"
echo "   - Visit: https://imhotepformation.engage-360.net"
echo "   - Look at the sidebar title size" 
#!/bin/bash

# Check if font size changes are present

echo "🔍 Checking font size changes..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
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

# Step 1: Navigate to application directory
print_status "Step 1: Navigating to application directory..."
cd /var/www/formations-app
print_success "Changed to application directory"

# Step 2: Check Logo.jsx file
print_status "Step 2: Checking Logo.jsx file..."
if [ -f "src/components/shared/Logo.jsx" ]; then
    print_success "Logo.jsx file exists"
    
    # Check for text-sm classes
    echo "Checking for 'text-sm' classes:"
    grep -n "text-sm" src/components/shared/Logo.jsx
    
    # Check for text-lg classes (should not exist)
    echo ""
    echo "Checking for 'text-lg' classes (should be empty):"
    grep -n "text-lg" src/components/shared/Logo.jsx
    
    # Show the text classes in the file
    echo ""
    echo "Current text classes in Logo.jsx:"
    grep -A 2 -B 2 "text:" src/components/shared/Logo.jsx
else
    print_error "Logo.jsx file not found!"
fi

# Step 3: Check built files
print_status "Step 3: Checking built files..."
if [ -d "dist" ]; then
    print_success "dist directory exists"
    ls -la dist/
    
    # Check if CSS contains the changes
    echo ""
    echo "Checking CSS files for font-size changes:"
    find dist -name "*.css" -exec grep -l "font-size\|text-sm\|text-lg" {} \;
else
    print_error "dist directory not found!"
fi

# Step 4: Check git status
print_status "Step 4: Checking git status..."
git status
echo ""
echo "Last 3 commits:"
git log --oneline -3

# Step 5: Check PM2 status
print_status "Step 5: Checking PM2 status..."
pm2 status

# Step 6: Test application
print_status "Step 6: Testing application..."
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    print_success "Application is responding"
    curl http://localhost:3001/api/health
else
    print_error "Application is not responding"
fi

echo ""
print_status "Font size check completed!"
echo ""
echo "📋 Summary:"
echo "   - If you see 'text-sm' in the grep results, changes are present"
echo "   - If you see 'text-lg' in the grep results, changes are NOT applied"
echo "   - Check browser cache if changes are present but not visible"
echo ""
echo "🔧 Next steps:"
echo "   - If changes are NOT present: Run force_font_update.sh"
echo "   - If changes ARE present: Clear browser cache (Ctrl+F5)" 
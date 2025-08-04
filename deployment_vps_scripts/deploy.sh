#!/bin/bash

# 🚀 Formations App Deployment Script for Hostinger VPS
# Server: 147.93.44.169
# Repository: https://github.com/bkourouma/imhotepformation.git

set -e  # Exit on any error

echo "🚀 Starting deployment of Formations App..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Step 1: Update system packages
print_status "Step 1: Updating system packages..."
apt update && apt upgrade -y
print_success "System packages updated"

# Step 2: Install required software
print_status "Step 2: Installing required software..."
apt install -y curl wget git nginx certbot python3-certbot-nginx

# Install Node.js 18.x
print_status "Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PM2 for process management
npm install -g pm2

print_success "Required software installed"

# Step 3: Create application directory
print_status "Step 3: Setting up application directory..."
APP_DIR="/var/www/formations-app"
mkdir -p $APP_DIR
cd $APP_DIR

# Step 4: Clone the repository
print_status "Step 4: Cloning repository..."
if [ -d ".git" ]; then
    print_warning "Repository already exists, pulling latest changes..."
    git pull origin main
else
    git clone https://github.com/bkourouma/imhotepformation.git .
fi
print_success "Repository cloned/updated"

# Step 5: Install dependencies
print_status "Step 5: Installing dependencies..."
npm install
print_success "Dependencies installed"

# Step 6: Build the application
print_status "Step 6: Building the application..."
npm run build
print_success "Application built"

# Step 7: Create environment file
print_status "Step 7: Creating environment configuration..."
cat > .env << EOF
NODE_ENV=production
PORT=3001
EOF
print_success "Environment file created"

# Step 8: Configure PM2
print_status "Step 8: Configuring PM2..."
pm2 delete formations-app 2>/dev/null || true
pm2 start server/server.js --name "formations-app" --env production
pm2 save
pm2 startup
print_success "PM2 configured"

# Step 9: Configure Nginx
print_status "Step 9: Configuring Nginx..."
cat > /etc/nginx/sites-available/formations-app << EOF
server {
    listen 80;
    server_name formations.engage-360.net;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/formations-app /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
print_success "Nginx configured"

# Step 10: Setup SSL certificate
print_status "Step 10: Setting up SSL certificate..."
certbot --nginx -d formations.engage-360.net --non-interactive --agree-tos --email admin@engage-360.net
print_success "SSL certificate configured"

# Step 11: Final verification
print_status "Step 11: Final verification..."
sleep 5
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    print_success "Application is running successfully!"
    echo "🌐 Your application is now available at: https://formations.engage-360.net"
else
    print_error "Application health check failed. Please check the logs:"
    pm2 logs formations-app --lines 20
fi

print_success "Deployment completed! 🎉"
echo ""
echo "📋 Summary:"
echo "   - Application: https://formations.engage-360.net"
echo "   - API Health: https://formations.engage-360.net/api/health"
echo "   - PM2 Status: pm2 status"
echo "   - PM2 Logs: pm2 logs formations-app"
echo "   - Nginx Status: systemctl status nginx" 
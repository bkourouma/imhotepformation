#!/bin/bash

# Quick Deployment Script for FDFP-CGECI/ ASPCI
# Copy and paste this entire script into your SSH session

echo "🚀 Starting quick deployment..."

# Update system
apt update && apt upgrade -y

# Install required software
apt install -y curl wget git nginx certbot python3-certbot-nginx
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
npm install -g pm2

# Setup application directory
APP_DIR="/var/www/formations-app"
mkdir -p $APP_DIR
cd $APP_DIR

# Clone repository
git clone https://github.com/bkourouma/imhotepformation.git .

# Install dependencies and build
npm install
npm run build

# Create environment file
cat > .env << EOF
NODE_ENV=production
PORT=3001
EOF

# Configure PM2
pm2 delete formations-app 2>/dev/null || true
pm2 start server/server.js --name "formations-app" --env production
pm2 save
pm2 startup

# Configure Nginx
cat > /etc/nginx/sites-available/formations-app << 'EOF'
server {
    listen 80;
    server_name imhotepformation.engage-360.net;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/formations-app /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Setup SSL
certbot --nginx -d imhotepformation.engage-360.net --non-interactive --agree-tos --email admin@engage-360.net

# Final test
sleep 5
curl -f http://localhost:3001/api/health

echo "🎉 Deployment completed!"
echo "Your app should be available at: https://imhotepformation.engage-360.net" 
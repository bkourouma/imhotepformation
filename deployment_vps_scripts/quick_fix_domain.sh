#!/bin/bash

# Quick fix for domain and SSL issues

echo "🔧 Fixing domain and SSL configuration..."

# Remove old SSL certificate
certbot delete --cert-name imhotepformation.engage-360.net 2>/dev/null || true

# Create new Nginx configuration
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

# Enable site
ln -sf /etc/nginx/sites-available/formations-app /etc/nginx/sites-enabled/

# Test and reload Nginx
nginx -t && systemctl reload nginx

# Get new SSL certificate
certbot --nginx -d imhotepformation.engage-360.net --non-interactive --agree-tos --email admin@engage-360.net

echo "✅ Domain and SSL fixed!"
echo "Test your app: https://imhotepformation.engage-360.net" 
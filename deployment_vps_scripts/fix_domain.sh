#!/bin/bash

# Fix domain and SSL issues

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

# Test the application
sleep 5
if curl -f https://imhotepformation.engage-360.net/api/health > /dev/null 2>&1; then
    echo "✅ Application is working correctly!"
    echo "🌐 Your application is available at: https://imhotepformation.engage-360.net"
else
    echo "⚠️  Application health check failed. Please check: pm2 logs formations-app"
fi

echo ""
echo "📋 Summary:"
echo "   - Application: https://imhotepformation.engage-360.net"
echo "   - API Health: https://imhotepformation.engage-360.net/api/health"
echo "   - PM2 Status: pm2 status"
echo "   - PM2 Logs: pm2 logs formations-app"
echo "   - Nginx Status: systemctl status nginx" 
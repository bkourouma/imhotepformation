# 🚀 Step-by-Step Deployment Guide for FDFP-CGECI/ ASPCI

## 📋 Prerequisites
- **Server**: 147.93.44.169 (Hostinger VPS)
- **Domain**: imhotepformation.engage-360.net
- **Repository**: https://github.com/bkourouma/imhotepformation.git

---

## 🔧 Step 1: Connect to Your VPS Server

```bash
ssh root@147.93.44.169
```

**Verification**: You should see a welcome message and be logged in as root.

---

## 🔧 Step 2: Update System Packages

```bash
apt update && apt upgrade -y
```

**Verification**: No errors, packages updated successfully.

---

## 🔧 Step 3: Install Required Software

```bash
# Install basic tools
apt install -y curl wget git nginx certbot python3-certbot-nginx

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PM2 for process management
npm install -g pm2
```

**Verification**: 
```bash
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x or higher
pm2 --version   # Should show PM2 version
```

---

## 🛠️ Step 3: Setup Application Directory

```bash
# Create and navigate to application directory
APP_DIR="/var/www/formations-app"
mkdir -p $APP_DIR
cd $APP_DIR
pwd  # Should show /var/www/formations-app
```

**Verification**: You should be in `/var/www/formations-app` directory.

---

## 🔧 Step 5: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/bkourouma/imhotepformation.git .

# Verify the files are there
ls -la
```

**Verification**: You should see files like `package.json`, `server/`, `src/`, etc.

---

## 🔧 Step 6: Install Dependencies

```bash
npm install
```

**Verification**: No errors, `node_modules/` directory created.

---

## 🔧 Step 7: Build the Application

```bash
npm run build
```

**Verification**: A `dist/` directory should be created with built files.

---

## 🔧 Step 8: Create Environment Configuration

```bash
cat > .env << EOF
NODE_ENV=production
PORT=3001
EOF
```

**Verification**: 
```bash
cat .env  # Should show the environment variables
```

---

## 🚀 Step 8: Configure PM2

```bash
# Start the application with PM2
pm2 start server/server.js --name "formations-app" --env production
pm2 save
pm2 startup
```

**Verification**:
```bash
pm2 status  # Should show formations-app as online
pm2 logs formations-app --lines 10  # Should show startup logs
```

---

## 🌐 Step 9: Configure Nginx

```bash
# Create Nginx configuration
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

# Enable the site
ln -sf /etc/nginx/sites-available/formations-app /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

**Verification**: 
```bash
nginx -t  # Should show "syntax is ok"
systemctl status nginx  # Should show active (running)
```

---

## 🔒 Step 10: Setup SSL Certificate

```bash
# Install SSL certificate
certbot --nginx -d imhotepformation.engage-360.net --non-interactive --agree-tos --email admin@engage-360.net
```

**Verification**: 
```bash
certbot certificates  # Should show your certificate
```

---

## ✅ Step 11: Final Verification

```bash
# Test the application
curl -f https://imhotepformation.engage-360.net/api/health
```

**Expected Output**: Should return a JSON response indicating the API is healthy.

---

## 📊 Useful Commands for Monitoring

```bash
# Check application status
pm2 status

# View application logs
pm2 logs formations-app

# Check Nginx status
systemctl status nginx

# View Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Check system resources
htop
df -h
free -h
```

---

## 🔄 Updating the Application

```bash
cd /var/www/formations-app
git pull origin main
npm install
npm run build
pm2 restart formations-app
```

---

## 🔧 Troubleshooting

### Application Issues
```bash
# Check application logs
pm2 logs formations-app

# Restart application
cd /var/www/formations-app
git pull origin main
npm install
pm2 restart formations-app

# Check detailed logs
pm2 logs formations-app --lines 50
```

### Nginx Issues
```bash
# Check Nginx configuration
nginx -t

# Check Nginx logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### SSL Issues
```bash
# Check SSL certificate
certbot certificates

# Renew SSL certificate
certbot renew --dry-run
```

### Common Commands
1. Check the logs: `pm2 logs formations-app`
2. Check Nginx status: `systemctl status nginx`
3. Verify the domain DNS settings
4. Ensure the domain points to your server IP: 147.93.44.169 
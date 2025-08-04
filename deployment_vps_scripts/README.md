# 🚀 Formations App VPS Deployment

This directory contains all the necessary scripts to deploy your Formations App to your Hostinger VPS server.

## 📁 Files Overview

- **`deploy.sh`** - Complete automated deployment script
- **`quick_deploy.sh`** - Quick deployment script for copy-paste
- **`verify_deployment.sh`** - Verification script to check deployment status
- **`STEP_BY_STEP_DEPLOYMENT.md`** - Detailed manual deployment guide

## 🎯 Quick Start

### Option 1: Automated Deployment (Recommended)

1. **Connect to your VPS:**
   ```bash
   ssh root@147.93.44.169
   ```

2. **Upload and run the deployment script:**
   ```bash
   # Copy the deploy.sh content and save it on your server
   nano deploy.sh
   # Paste the content from deploy.sh file
   
   # Make it executable and run
   chmod +x deploy.sh
   ./deploy.sh
   ```

### Option 2: Manual Step-by-Step

Follow the detailed guide in `STEP_BY_STEP_DEPLOYMENT.md` for manual deployment.

### Option 3: Quick Copy-Paste

1. **Connect to your VPS:**
   ```bash
   ssh root@147.93.44.169
   ```

2. **Copy and paste the entire content of `quick_deploy.sh`** into your SSH session.

## 🔍 Verification

After deployment, run the verification script:

```bash
# Copy the verify_deployment.sh content and run it
chmod +x verify_deployment.sh
./verify_deployment.sh
```

## 📊 Expected Results

After successful deployment, you should have:

- ✅ Application running on PM2
- ✅ Nginx configured and running
- ✅ SSL certificate installed
- ✅ Application accessible at: https://formations.engage-360.net
- ✅ API health check working: https://formations.engage-360.net/api/health

## 🔧 Troubleshooting

### Common Issues:

1. **SSH Connection Issues**
   - Verify your SSH key is working
   - Try: `ssh -v root@147.93.44.169`

2. **Permission Issues**
   - Make sure you're running as root
   - Use: `sudo su -` if needed

3. **Domain Issues**
   - Ensure `formations.engage-360.net` points to `147.93.44.169`
   - Check DNS propagation: `nslookup formations.engage-360.net`

4. **Application Not Starting**
   - Check logs: `pm2 logs formations-app`
   - Check if port 3001 is free: `netstat -tulpn | grep 3001`

5. **SSL Certificate Issues**
   - Check certificate: `certbot certificates`
   - Renew if needed: `certbot renew`

## 📋 Useful Commands

```bash
# Check application status
pm2 status
pm2 logs formations-app

# Check Nginx
systemctl status nginx
nginx -t

# Check SSL
certbot certificates

# Restart services
pm2 restart formations-app
systemctl restart nginx

# Update application
cd /var/www/formations-app
git pull origin main
npm install
npm run build
pm2 restart formations-app
```

## 🆘 Support

If you encounter issues:

1. Check the logs: `pm2 logs formations-app --lines 50`
2. Verify Nginx: `systemctl status nginx`
3. Test the API: `curl http://localhost:3001/api/health`
4. Check SSL: `certbot certificates`

## 📞 Contact

For additional support, check the troubleshooting section in `STEP_BY_STEP_DEPLOYMENT.md`. 
# ✅ Production Deployment Checklist

Use this checklist while deploying to make sure you don't miss anything.

---

## 🎯 Pre-Deployment

### Get Required Accounts/Services
- [ ] VPS server purchased (DigitalOcean, Vultr, Hetzner, etc.)
- [ ] Domain name purchased (optional but recommended)
- [ ] Clerk account created at https://dashboard.clerk.com
- [ ] GitHub repository created (if not already)

### Get Clerk Production Keys
- [ ] Login to Clerk dashboard
- [ ] Switch to "Production" mode
- [ ] Copy `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (pk_live_...)
- [ ] Copy `CLERK_SECRET_KEY` (sk_live_...)
- [ ] Save these keys somewhere safe (password manager)

### Generate Security Keys
- [ ] Generate database password (20+ characters)
- [ ] Generate MinIO access key (20+ characters)
- [ ] Generate MinIO secret key (20+ characters)
- [ ] Generate MinIO admin password (20+ characters)
- [ ] Generate SETTINGS_ENCRYPTION_KEY (64 characters)
- [ ] Generate NEXTAUTH_SECRET (32+ characters)

**Generate passwords with:**
```bash
openssl rand -base64 32
```

---

## 🖥️ Server Setup

### Connect to VPS
- [ ] Received VPS IP address from provider
- [ ] Can connect via SSH: `ssh root@your-server-ip`

### Install Required Software
- [ ] Updated system: `apt update && apt upgrade -y`
- [ ] Installed tools: `apt install -y curl git ufw nano`
- [ ] Installed Docker
- [ ] Installed docker-compose
- [ ] Verified Docker works: `docker --version`

### Security Setup
- [ ] Configured firewall (ports 22, 80, 443)
- [ ] Enabled firewall: `ufw enable`
- [ ] Created appuser account
- [ ] Added appuser to docker group
- [ ] Can switch to appuser: `su - appuser`

---

## 📦 Application Deployment

### Code Setup
- [ ] Cloned repository to VPS
- [ ] Created `.env.production` file
- [ ] Added all environment variables
- [ ] Replaced ALL placeholder values with real ones
- [ ] Double-checked Clerk production keys (pk_live, not pk_test)
- [ ] Verified docker-compose.prod.yml exists

### Build & Start
- [ ] Built Docker images: `docker-compose -f docker-compose.prod.yml up -d --build`
- [ ] Waited for build to complete (5-10 minutes)
- [ ] All containers running: `docker-compose -f docker-compose.prod.yml ps`
- [ ] nextjs-app is "Up"
- [ ] postgres is "Up (healthy)"
- [ ] redis is "Up"
- [ ] minio is "Up (healthy)"

### Database Setup
- [ ] Generated Prisma client: `docker-compose -f docker-compose.prod.yml exec nextjs-app npx prisma generate`
- [ ] Ran migrations: `docker-compose -f docker-compose.prod.yml exec nextjs-app npx prisma migrate deploy`
- [ ] Created MinIO bucket: `docker-compose -f docker-compose.prod.yml exec nextjs-app npm run setup:minio`
- [ ] Created super admin: `docker-compose -f docker-compose.prod.yml exec nextjs-app npm run setup:super-admin`

### Test Locally on Server
- [ ] App responds: `curl http://localhost:3000`
- [ ] Checked logs for errors: `docker-compose -f docker-compose.prod.yml logs nextjs-app`

---

## 🌐 Domain & HTTPS Setup

### DNS Configuration
- [ ] Added A record: @ → VPS IP
- [ ] Added A record: www → VPS IP
- [ ] Waited 15 minutes for DNS propagation
- [ ] Verified DNS: `ping your-domain.com` returns VPS IP

### Nginx Installation
- [ ] Installed Nginx: `sudo apt install -y nginx`
- [ ] Nginx is running: `sudo systemctl status nginx`
- [ ] Installed Certbot: `sudo apt install -y certbot python3-certbot-nginx`

### Nginx Configuration
- [ ] Created config file: `/etc/nginx/sites-available/garritwulf`
- [ ] Replaced `your-domain.com` with actual domain in config
- [ ] Enabled site: `ln -s /etc/nginx/sites-available/garritwulf /etc/nginx/sites-enabled/`
- [ ] Removed default site: `rm /etc/nginx/sites-enabled/default`
- [ ] Tested config: `nginx -t` (should say "ok")
- [ ] Reloaded Nginx: `sudo systemctl reload nginx`

### SSL Certificate
- [ ] Ran Certbot: `sudo certbot --nginx -d your-domain.com -d www.your-domain.com`
- [ ] Entered email address
- [ ] Agreed to terms
- [ ] Certificate obtained successfully
- [ ] Tested auto-renewal: `sudo certbot renew --dry-run`

---

## 🔐 Clerk Configuration

### Clerk Dashboard Settings
- [ ] Switched to Production mode in Clerk
- [ ] Added domain in Clerk: "Domains" section
- [ ] Domain verified/approved

### Webhook Setup
- [ ] Created webhook in Clerk dashboard
- [ ] Webhook URL: `https://your-domain.com/api/webhooks/clerk`
- [ ] Selected events: user.created, user.updated, user.deleted
- [ ] Copied webhook signing secret (whsec_...)
- [ ] Added CLERK_WEBHOOK_SECRET to .env.production
- [ ] Restarted app: `docker-compose -f docker-compose.prod.yml restart nextjs-app`

### Environment Variables
- [ ] NEXT_PUBLIC_APP_URL matches actual domain (https://...)
- [ ] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is pk_live_...
- [ ] CLERK_SECRET_KEY is sk_live_...
- [ ] CLERK_WEBHOOK_SECRET is whsec_...

---

## ✅ Final Testing

### Website Access
- [ ] Website loads: https://your-domain.com
- [ ] Green padlock (SSL) showing in browser
- [ ] No mixed content warnings
- [ ] Homepage displays correctly

### Authentication
- [ ] "Sign In" button works
- [ ] Can create new account
- [ ] Can log in with existing account
- [ ] Can log out
- [ ] Redirects work correctly

### Admin Panel
- [ ] Can access: https://your-domain.com/admin
- [ ] Dashboard loads
- [ ] Settings page works
- [ ] Navigation works

### Products
- [ ] Can create new product
- [ ] Can upload product image
- [ ] Image displays correctly
- [ ] Product shows on products page
- [ ] Product detail page works

### Contact Form
- [ ] Can submit contact message
- [ ] Message appears in admin panel
- [ ] No errors in console

### Browser Testing
- [ ] Tested in Chrome
- [ ] Tested in Firefox
- [ ] Tested in Safari (if available)
- [ ] Tested on mobile device
- [ ] No console errors

---

## 🔄 Post-Deployment Setup

### Backups
- [ ] Created backup script: `~/scripts/backup-db.sh`
- [ ] Made script executable: `chmod +x ~/scripts/backup-db.sh`
- [ ] Tested backup manually: `~/scripts/backup-db.sh`
- [ ] Scheduled daily backups in crontab
- [ ] Verified backup files created: `ls -lh ~/backups/`

### Monitoring
- [ ] Created health check script (optional)
- [ ] Scheduled health checks in crontab (optional)
- [ ] Configured log rotation

### Documentation
- [ ] Saved all passwords in password manager
- [ ] Documented VPS IP address
- [ ] Documented domain registrar login
- [ ] Documented Clerk dashboard access
- [ ] Saved deployment date

---

## 📝 Information to Save

Write these down in your password manager:

```
VPS Provider: _________________
VPS IP Address: _________________
VPS Root Password: _________________
VPS Appuser Password: _________________

Domain Registrar: _________________
Domain: _________________
Domain Login: _________________

GitHub Repository: _________________

Clerk Account Email: _________________
Clerk Production Keys: (saved in password manager)
Clerk Webhook Secret: (saved in password manager)

Database Password: _________________
MinIO Access Key: _________________
MinIO Secret Key: _________________
MinIO Admin Password: _________________
Settings Encryption Key: _________________
NextAuth Secret: _________________
```

---

## 🆘 If Something Goes Wrong

### Website not loading?
```bash
sudo systemctl status nginx
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs nextjs-app
```

### Can't log in?
- Check you're using pk_live_ keys (not pk_test_)
- Check domain is added in Clerk dashboard
- Check NEXT_PUBLIC_APP_URL is correct

### Database error?
```bash
docker-compose -f docker-compose.prod.yml restart postgres
sleep 10
docker-compose -f docker-compose.prod.yml restart nextjs-app
```

### Images not uploading?
```bash
docker-compose -f docker-compose.prod.yml restart minio
docker-compose -f docker-compose.prod.yml exec nextjs-app npm run setup:minio
```

---

## 🎉 Deployment Complete!

Once all checkboxes are checked, your site is live and ready for production use!

**Next steps:**
- Share your website with users
- Monitor logs for any issues
- Keep backups running
- Update code as needed

**Need to update your site?**
See: "Part 6: Making Updates" in DOCKER-VPS-DEPLOYMENT.md

# 🐳 Docker VPS Deployment Guide (Complete)

**Complete guide for deploying your Next.js application on a VPS using Docker**

---

## 📋 What You'll Need

1. **VPS Server** (DigitalOcean, AWS EC2, Linode, Vultr, Hetzner, etc.)
   - Minimum: 2GB RAM, 2 CPU cores, 40GB storage
   - Recommended: 4GB RAM, 2 CPU cores, 80GB storage
   - OS: Ubuntu 22.04 LTS (recommended)

2. **Domain Name** (optional but recommended)
   - Example: `garritwulf.com`
   - You can buy from Namecheap, GoDaddy, Cloudflare, etc.

3. **SSH Access** to your VPS

4. **Clerk Production Keys**
   - Get from: https://dashboard.clerk.com
   - Switch to "Production" mode
   - Copy `pk_live_...` and `sk_live_...` keys

---

## 🚀 Part 1: Server Setup (One Time Only)

### Step 1: Connect to Your VPS

```bash
# Use the IP provided by your VPS provider
ssh root@your-server-ip

# Example:
ssh root@142.93.45.123
```

### Step 2: Update System

```bash
# Update all packages
apt update && apt upgrade -y

# Install essential tools
apt install -y curl git ufw nano
```

### Step 3: Install Docker

```bash
# Install Docker (official script)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install -y docker-compose

# Start Docker and enable on boot
systemctl start docker
systemctl enable docker

# Verify installation
docker --version
docker-compose --version

# You should see versions like:
# Docker version 24.0.7
# docker-compose version 1.29.2
```

### Step 4: Setup Firewall

```bash
# Allow SSH (IMPORTANT: Don't lock yourself out!)
ufw allow 22/tcp

# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw --force enable

# Check status (should show all 3 ports allowed)
ufw status
```

### Step 5: Create Application User (Security Best Practice)

```bash
# Create user for running apps (not root)
adduser appuser
# Set a password when prompted

# Add to docker group (so they can use Docker)
usermod -aG docker appuser

# Give sudo access
usermod -aG sudo appuser

# Switch to app user
su - appuser

# Verify you're now appuser
whoami
# Should output: appuser
```

---

## 📦 Part 2: Deploy Your Application

### Step 1: Clone Your Repository

```bash
# Make sure you're still logged in as appuser
cd ~

# Clone your repository
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name

# If repository is private, you'll need to setup SSH key or use token
```

**If you need to setup GitHub SSH (for private repos):**

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"
# Press Enter for all prompts

# Display public key
cat ~/.ssh/id_ed25519.pub

# Copy this key and add to GitHub:
# GitHub → Settings → SSH and GPG keys → New SSH key
```

### Step 2: Create Production Environment File

```bash
# Create environment file
nano .env.production
```

Copy and paste this (then modify the values):

```bash
# ==================================
# PRODUCTION ENVIRONMENT
# ==================================

# App Settings
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Clerk Authentication - PRODUCTION KEYS
# Get these from: https://dashboard.clerk.com (switch to Production mode)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_PRODUCTION_KEY_HERE
CLERK_SECRET_KEY=sk_live_YOUR_PRODUCTION_SECRET_HERE
CLERK_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Clerk URLs (keep these as-is)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Database (PostgreSQL)
# These work with Docker - don't change hostname "postgres"
DATABASE_URL=postgresql://garritwulf_user:STRONG_PASSWORD_HERE_123@postgres:5432/garritwulf_db
POSTGRES_USER=garritwulf_user
POSTGRES_PASSWORD=STRONG_PASSWORD_HERE_123
POSTGRES_DB=garritwulf_db

# Redis Cache
# Hostname "redis" is from docker-compose - don't change
REDIS_URL=redis://redis:6379

# MinIO Storage (S3-compatible)
# Hostname "minio" is from docker-compose - don't change
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_REGION=us-east-1
MINIO_ACCESS_KEY=garritwulf_minio_prod
MINIO_SECRET_KEY=STRONG_MINIO_SECRET_456
MINIO_USE_SSL=false
MINIO_BUCKET_NAME=garritwulf

# MinIO Admin Credentials
MINIO_ROOT_USER=admin_prod_user
MINIO_ROOT_PASSWORD=STRONG_MINIO_ADMIN_789

# Security Keys
# Generate 64-char random string: https://generate-random.org/encryption-key-generator
SETTINGS_ENCRYPTION_KEY=GENERATE_A_RANDOM_64_CHARACTER_STRING_HERE
NEXTAUTH_SECRET=GENERATE_ANOTHER_RANDOM_STRING_HERE
```

**Save the file:**

- Press `CTRL + X`
- Press `Y` (yes)
- Press `Enter`

**⚠️ IMPORTANT:** Replace ALL these placeholders with strong, unique values:

- `STRONG_PASSWORD_HERE_123` - Use 20+ character password
- `STRONG_MINIO_SECRET_456` - Use 20+ character password
- `STRONG_MINIO_ADMIN_789` - Use 20+ character password
- `GENERATE_A_RANDOM_64_CHARACTER_STRING_HERE` - Use 64-char random string
- `GENERATE_ANOTHER_RANDOM_STRING_HERE` - Use 32+ character random string

**Generate secure passwords:**

```bash
# On your VPS, run this to generate passwords:
openssl rand -base64 32
```

### Step 3: Update Docker Compose File

Make sure your `docker-compose.prod.yml` is configured correctly:

```bash
nano docker-compose.prod.yml
```

It should look like this:

```yaml
version: "3.8"

services:
  nextjs-app:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
      minio:
        condition: service_healthy
    networks:
      - garrit-network
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    env_file:
      - .env.production
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - garrit-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - garrit-network
    restart: unless-stopped

  minio:
    image: minio/minio:latest
    env_file:
      - .env.production
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    networks:
      - garrit-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

volumes:
  postgres_data:
  redis_data:
  minio_data:

networks:
  garrit-network:
    driver: bridge
```

Save and exit (CTRL+X, Y, Enter).

### Step 4: Build and Start All Services

```bash
# Build and start all services in background
docker-compose -f docker-compose.prod.yml up -d --build

# This will take 5-10 minutes for the first build
# You'll see output like:
# Building nextjs-app...
# Pulling postgres...
# Creating network...
# Creating volumes...
```

**Watch the build progress:**

```bash
docker-compose -f docker-compose.prod.yml logs -f
```

Press `CTRL + C` to stop watching logs (services keep running).

### Step 5: Wait for Services to Start

```bash
# Wait 30 seconds for all services to initialize
sleep 30

# Check all containers are running
docker-compose -f docker-compose.prod.yml ps

# You should see:
# nextjs-app - Up
# postgres   - Up (healthy)
# redis      - Up
# minio      - Up (healthy)
```

### Step 6: Run Database Migrations

```bash
# Generate Prisma client
docker-compose -f docker-compose.prod.yml exec nextjs-app npx prisma generate

# Run database migrations
docker-compose -f docker-compose.prod.yml exec nextjs-app npx prisma migrate deploy

# You should see:
# ✓ Migration applied successfully
```

### Step 7: Setup MinIO Bucket

```bash
# Create the storage bucket
docker-compose -f docker-compose.prod.yml exec nextjs-app npm run setup:minio

# You should see:
# ✓ Bucket created successfully
```

### Step 8: Create Super Admin (Optional)

```bash
# Run super admin setup
docker-compose -f docker-compose.prod.yml exec nextjs-app npm run setup:super-admin

# Follow the prompts to create admin user
```

### Step 9: Verify App is Running

```bash
# Test the app locally on server
curl http://localhost:3000

# You should see HTML output
# If you see "Connection refused", wait a bit longer and try again
```

---

## 🌐 Part 3: Setup Nginx Reverse Proxy (HTTPS)

Now we'll make your site accessible from the internet with HTTPS.

### Step 1: Install Nginx

```bash
# Switch to root (enter your appuser password)
sudo -i

# Install Nginx
apt install -y nginx

# Start Nginx
systemctl start nginx
systemctl enable nginx

# Check it's running
systemctl status nginx
# Should show "active (running)"
```

### Step 2: Install Certbot for Free SSL

```bash
# Install Certbot (Let's Encrypt SSL)
apt install -y certbot python3-certbot-nginx

# Exit root back to appuser
exit
```

### Step 3: Point Your Domain to VPS

**Before getting SSL, you MUST:**

1. Go to your domain registrar (Namecheap, GoDaddy, etc.)
2. Add an A record:
   - Type: `A`
   - Name: `@` (or leave blank)
   - Value: `your-vps-ip-address`
   - TTL: `3600` (or automatic)
3. Add another A record for www:
   - Type: `A`
   - Name: `www`
   - Value: `your-vps-ip-address`
   - TTL: `3600`
4. Wait 5-15 minutes for DNS to propagate

**Check if DNS is ready:**

```bash
# Test your domain (replace with your actual domain)
ping your-domain.com
# Should return your VPS IP
```

### Step 4: Create Nginx Configuration

```bash
# Switch to root
sudo -i

# Create config file (replace your-domain.com with actual domain)
nano /etc/nginx/sites-available/garritwulf
```

Copy this configuration (replace `your-domain.com` with your actual domain):

```nginx
# Redirect www to non-www
server {
    listen 80;
    server_name www.your-domain.com;
    return 301 https://your-domain.com$request_uri;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;

    # Let Certbot use this for verification
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

# Main HTTPS server
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL certificates (will be added by Certbot)
    # ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logs
    access_log /var/log/nginx/garritwulf-access.log;
    error_log /var/log/nginx/garritwulf-error.log;

    # Max upload size (for product images)
    client_max_body_size 50M;

    # Proxy to Next.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

Save and exit (CTRL+X, Y, Enter).

### Step 5: Enable the Site

```bash
# Create symbolic link to enable site
ln -s /etc/nginx/sites-available/garritwulf /etc/nginx/sites-enabled/

# Remove default Nginx site
rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Should say: "syntax is ok" and "test is successful"

# Reload Nginx
systemctl reload nginx
```

### Step 6: Get Free SSL Certificate

```bash
# Get SSL certificate (replace with your actual domain and email)
certbot --nginx -d your-domain.com -d www.your-domain.com --email your-email@example.com --agree-tos --no-eff-email

# Certbot will:
# 1. Verify domain ownership
# 2. Generate certificates
# 3. Update Nginx config automatically
# 4. Setup auto-renewal

# You should see: "Successfully received certificate"
```

### Step 7: Verify HTTPS Works

```bash
# Exit from root back to appuser
exit

# Test HTTPS
curl https://your-domain.com

# Should return HTML (your website)
```

Open browser and visit: `https://your-domain.com`
You should see green padlock (secure) and your website!

### Step 8: Setup Auto-Renewal for SSL

```bash
# Test auto-renewal (dry run - doesn't actually renew)
sudo certbot renew --dry-run

# Should say: "Congratulations, all simulated renewals succeeded"

# Certbot automatically creates systemd timer for renewal
# Check it's scheduled:
systemctl list-timers | grep certbot

# Should show certbot.timer scheduled
```

---

## 🔐 Part 4: Setup Clerk Production

### Step 1: Update Clerk Dashboard

1. Go to: https://dashboard.clerk.com
2. Make sure you're in **Production** mode (toggle at top)
3. Click **"Domains"** in sidebar
4. Click **"Add domain"**
5. Enter: `your-domain.com`
6. Follow verification instructions if required

### Step 2: Get Production Keys

1. Still in Clerk dashboard, click **"API Keys"**
2. Make sure you're in **Production** tab
3. Copy these keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_live_...`)
   - `CLERK_SECRET_KEY` (starts with `sk_live_...`)
4. Update your `.env.production` file if you haven't already

### Step 3: Setup Webhook

1. In Clerk dashboard, click **"Webhooks"** in sidebar
2. Click **"Add Endpoint"**
3. Endpoint URL: `https://your-domain.com/api/webhooks/clerk`
4. Select these events:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`
5. Click **"Create"**
6. Copy the **Signing Secret** (starts with `whsec_...`)

### Step 4: Add Webhook Secret to Environment

```bash
# SSH to your VPS (if not already connected)
ssh appuser@your-server-ip

# Go to your app directory
cd ~/your-repo-name

# Edit environment file
nano .env.production

# Find the line:
CLERK_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Replace with your actual webhook secret
# Save and exit (CTRL+X, Y, Enter)

# Restart the app to apply changes
docker-compose -f docker-compose.prod.yml restart nextjs-app

# Wait 10 seconds
sleep 10
```

### Step 5: Update App URL

```bash
# Make sure your .env.production has correct URL
nano .env.production

# Find:
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Make sure it matches your actual domain
# Save if you made changes

# Restart if you changed it
docker-compose -f docker-compose.prod.yml restart nextjs-app
```

---

## ✅ Part 5: Final Verification

### Test Everything

Visit your website and test:

1. **Homepage**: `https://your-domain.com`
   - [ ] Loads correctly
   - [ ] Green padlock (HTTPS)
   - [ ] No console errors

2. **Sign In**: Click "Sign In" button
   - [ ] Clerk modal opens
   - [ ] Can create account
   - [ ] Can log in
   - [ ] Redirects correctly

3. **Admin Dashboard**: `https://your-domain.com/admin`
   - [ ] Loads (after logging in)
   - [ ] Can access settings

4. **Create Product**:
   - [ ] Go to Products section
   - [ ] Create test product
   - [ ] Upload image
   - [ ] Product saves successfully

5. **View Product Page**:
   - [ ] Product displays on site
   - [ ] Image loads correctly

6. **Contact Form**:
   - [ ] Submit test message
   - [ ] Check if it saves (admin panel)

### Check Logs

```bash
# View recent logs
docker-compose -f docker-compose.prod.yml logs --tail=100 nextjs-app

# Look for any errors
# Should see: "Ready on http://0.0.0.0:3000"
```

### Check All Services

```bash
docker-compose -f docker-compose.prod.yml ps

# All should show "Up" status:
# ✓ nextjs-app
# ✓ postgres (healthy)
# ✓ redis
# ✓ minio (healthy)
```

---

## 🔄 Part 6: Making Updates

When you make changes to your code:

### On Your Local Computer:

```bash
# Make your changes
# Test locally with: npm run dev

# Commit changes
git add .
git commit -m "Describe your changes"

# Push to GitHub
git push origin main
```

### On Your VPS:

```bash
# SSH to server
ssh appuser@your-server-ip

# Go to app directory
cd ~/your-repo-name

# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build

# If you changed database schema, run migrations:
docker-compose -f docker-compose.prod.yml exec nextjs-app npx prisma migrate deploy

# Check logs to verify
docker-compose -f docker-compose.prod.yml logs --tail=50 nextjs-app
```

---

## 🔧 Part 7: Useful Commands

### View Logs

```bash
# All services (follow live)
docker-compose -f docker-compose.prod.yml logs -f

# Just Next.js app
docker-compose -f docker-compose.prod.yml logs -f nextjs-app

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100 nextjs-app

# PostgreSQL logs
docker-compose -f docker-compose.prod.yml logs postgres
```

### Restart Services

```bash
# Restart all
docker-compose -f docker-compose.prod.yml restart

# Restart specific service
docker-compose -f docker-compose.prod.yml restart nextjs-app
docker-compose -f docker-compose.prod.yml restart postgres
docker-compose -f docker-compose.prod.yml restart redis
docker-compose -f docker-compose.prod.yml restart minio
```

### Access Container Shell

```bash
# Next.js container
docker-compose -f docker-compose.prod.yml exec nextjs-app sh

# Inside container, you can run:
# - npm commands
# - prisma commands
# - view files
# Exit with: exit

# PostgreSQL database
docker-compose -f docker-compose.prod.yml exec postgres psql -U garritwulf_user -d garritwulf_db

# Inside database, you can run SQL:
# \dt          - List tables
# SELECT * FROM "User";  - Query users
# \q           - Exit
```

### Database Operations

```bash
# Run Prisma Studio (database GUI)
docker-compose -f docker-compose.prod.yml exec nextjs-app npx prisma studio

# Then visit: http://your-server-ip:5555
# (Note: Only accessible from your VPS, not public)

# Run migrations
docker-compose -f docker-compose.prod.yml exec nextjs-app npx prisma migrate deploy

# Reset database (⚠️ DELETES ALL DATA)
docker-compose -f docker-compose.prod.yml exec nextjs-app npx prisma migrate reset
```

### Backup Database

```bash
# Create backup file
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U garritwulf_user garritwulf_db > backup-$(date +%Y%m%d-%H%M%S).sql

# Backups are saved in current directory
ls -lh backup-*.sql

# Restore from backup
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U garritwulf_user garritwulf_db < backup-20250103-143022.sql
```

### Monitor Resources

```bash
# Real-time resource usage
docker stats

# Disk usage
df -h

# Docker disk usage
docker system df

# List volumes
docker volume ls
```

### Clean Up

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes (⚠️ careful!)
docker volume prune

# Clean everything unused
docker system prune -a --volumes

# Stop all services
docker-compose -f docker-compose.prod.yml down

# Stop and remove volumes (⚠️ DELETES DATA)
docker-compose -f docker-compose.prod.yml down -v
```

---

## 🆘 Part 8: Troubleshooting

### Problem: Website Not Loading

**Check Nginx:**

```bash
sudo systemctl status nginx
sudo nginx -t
sudo tail -f /var/log/nginx/garritwulf-error.log
```

**Check Docker:**

```bash
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs nextjs-app
```

**Solutions:**

```bash
# Restart Nginx
sudo systemctl restart nginx

# Restart Docker services
docker-compose -f docker-compose.prod.yml restart
```

### Problem: Database Connection Error

**Check PostgreSQL:**

```bash
docker-compose -f docker-compose.prod.yml ps postgres
docker-compose -f docker-compose.prod.yml logs postgres
```

**Solutions:**

```bash
# Restart database
docker-compose -f docker-compose.prod.yml restart postgres

# Wait 10 seconds then restart app
sleep 10
docker-compose -f docker-compose.prod.yml restart nextjs-app

# If still failing, check credentials in .env.production
nano .env.production
# Make sure DATABASE_URL matches POSTGRES_* variables
```

### Problem: Images Not Uploading

**Check MinIO:**

```bash
docker-compose -f docker-compose.prod.yml ps minio
docker-compose -f docker-compose.prod.yml logs minio
```

**Solutions:**

```bash
# Restart MinIO
docker-compose -f docker-compose.prod.yml restart minio

# Recreate bucket
docker-compose -f docker-compose.prod.yml exec nextjs-app npm run setup:minio

# Check MinIO credentials in .env.production
```

### Problem: Clerk Authentication Not Working

**Checklist:**

- [ ] Using production keys (pk*live*, not pk*test*)
- [ ] Domain added in Clerk dashboard
- [ ] NEXT_PUBLIC_APP_URL matches your actual domain
- [ ] Webhook secret is correct

**Solutions:**

```bash
# Update environment
nano .env.production

# Make sure:
# - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY starts with pk_live_
# - CLERK_SECRET_KEY starts with sk_live_
# - NEXT_PUBLIC_APP_URL is https://your-domain.com

# Restart app
docker-compose -f docker-compose.prod.yml restart nextjs-app
```

### Problem: SSL Certificate Error

**Solutions:**

```bash
# Renew certificate manually
sudo certbot renew --force-renewal

# Test auto-renewal
sudo certbot renew --dry-run

# Check certificate
sudo certbot certificates
```

### Problem: Out of Disk Space

**Check space:**

```bash
df -h
```

**Clean up:**

```bash
# Remove Docker unused data
docker system prune -a

# Remove old logs
sudo journalctl --vacuum-time=7d

# Remove old backups
rm ~/backup-*.sql
```

### Problem: Port Already in Use

```bash
# Check what's using port 3000
sudo lsof -i :3000

# Kill process (replace PID)
sudo kill -9 PID

# Or change port in docker-compose.prod.yml
# Change: "3000:3000" to "3001:3000"
```

### Problem: Container Keeps Restarting

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs --tail=200 nextjs-app

# Common causes:
# - Build error (check syntax)
# - Missing environment variable
# - Database not ready
# - Port conflict
```

---

## 📊 Part 9: Monitoring & Maintenance

### Setup Automatic Backups

Create backup script:

```bash
# Create scripts directory
mkdir -p ~/scripts

# Create backup script
nano ~/scripts/backup-db.sh
```

Add this content:

```bash
#!/bin/bash

# Configuration
BACKUP_DIR=~/backups
PROJECT_DIR=~/your-repo-name
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Go to project directory
cd $PROJECT_DIR

# Backup database
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U garritwulf_user garritwulf_db > $BACKUP_DIR/db-$DATE.sql

# Compress backup
gzip $BACKUP_DIR/db-$DATE.sql

# Backup MinIO data (optional)
docker run --rm \
  -v your-repo-name_minio_data:/data \
  -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/minio-$DATE.tar.gz /data

# Keep only last 7 days of backups
find $BACKUP_DIR -name "db-*.sql.gz" -mtime +7 -delete
find $BACKUP_DIR -name "minio-*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

Make executable:

```bash
chmod +x ~/scripts/backup-db.sh

# Test it
~/scripts/backup-db.sh

# Check backup was created
ls -lh ~/backups/
```

Schedule daily backups:

```bash
# Edit crontab
crontab -e

# Add this line (runs at 2 AM every day):
0 2 * * * /home/appuser/scripts/backup-db.sh >> /home/appuser/backup.log 2>&1

# Save and exit
```

### Setup Log Rotation

```bash
# Create log rotation config
sudo nano /etc/logrotate.d/garritwulf
```

Add:

```
/var/log/nginx/garritwulf-*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        systemctl reload nginx
    endscript
}
```

### Setup Simple Monitoring

Create health check script:

```bash
nano ~/scripts/health-check.sh
```

Add:

```bash
#!/bin/bash

# Check if website is responding
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://your-domain.com)

if [ $STATUS -ne 200 ]; then
    echo "$(date): Website down! Status: $STATUS" >> ~/health-check.log

    # Restart services
    cd ~/your-repo-name
    docker-compose -f docker-compose.prod.yml restart

    echo "$(date): Services restarted" >> ~/health-check.log
fi
```

Make executable and schedule:

```bash
chmod +x ~/scripts/health-check.sh

# Run every 5 minutes
crontab -e

# Add:
*/5 * * * * /home/appuser/scripts/health-check.sh
```

---

## 💰 Part 10: Cost Breakdown

| Item            | Provider      | Monthly Cost           |
| --------------- | ------------- | ---------------------- |
| VPS (4GB RAM)   | DigitalOcean  | $24                    |
| VPS (4GB RAM)   | Vultr         | $18                    |
| VPS (4GB RAM)   | Hetzner       | $12                    |
| Domain          | Namecheap     | $1-2                   |
| SSL Certificate | Let's Encrypt | FREE                   |
| Docker          | Open Source   | FREE                   |
| Nginx           | Open Source   | FREE                   |
| Clerk           | Free Tier     | FREE (up to 10K users) |

**Total: $14-26/month depending on VPS provider**

---

## 🎉 Congratulations!

Your application is now fully deployed with:

- ✅ Running on production VPS with Docker
- ✅ HTTPS enabled (SSL certificate)
- ✅ Clerk production authentication
- ✅ PostgreSQL database (containerized)
- ✅ Redis cache (containerized)
- ✅ MinIO storage (containerized)
- ✅ Nginx reverse proxy
- ✅ Automatic SSL renewal
- ✅ Firewall protection
- ✅ Automatic restarts on failure
- ✅ Daily backups scheduled
- ✅ Log rotation configured

---

## 📚 Quick Reference

### Important URLs

- **Website**: https://your-domain.com
- **Admin Panel**: https://your-domain.com/admin
- **Clerk Dashboard**: https://dashboard.clerk.com

### Important Commands

```bash
# SSH to server
ssh appuser@your-server-ip

# View logs
cd ~/your-repo-name
docker-compose -f docker-compose.prod.yml logs -f nextjs-app

# Restart app
docker-compose -f docker-compose.prod.yml restart nextjs-app

# Update app
git pull && docker-compose -f docker-compose.prod.yml up -d --build

# Backup database
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U garritwulf_user garritwulf_db > backup.sql

# Check all services
docker-compose -f docker-compose.prod.yml ps
```

### Important Files

- **Application**: `~/your-repo-name/`
- **Environment**: `~/your-repo-name/.env.production`
- **Nginx Config**: `/etc/nginx/sites-available/garritwulf`
- **SSL Certs**: `/etc/letsencrypt/live/your-domain.com/`
- **Backups**: `~/backups/`

### Important Ports

- **80**: HTTP (redirects to HTTPS)
- **443**: HTTPS (public)
- **3000**: Next.js (internal only)
- **5432**: PostgreSQL (internal only)
- **6379**: Redis (internal only)
- **9000**: MinIO (internal only)

---

## 🆘 Need Help?

- **Docker Issues**: https://docs.docker.com
- **Next.js Issues**: https://nextjs.org/docs
- **Nginx Issues**: https://nginx.org/en/docs/
- **Clerk Issues**: https://clerk.com/docs
- **SSL Issues**: https://certbot.eff.org/docs/

**Pro tip**: Always check the logs first when something goes wrong:

```bash
docker-compose -f docker-compose.prod.yml logs --tail=100 nextjs-app
```

**Good luck with your deployment! 🚀**

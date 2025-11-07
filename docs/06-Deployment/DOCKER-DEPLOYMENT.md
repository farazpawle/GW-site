# 🐳 Docker VPS Deployment Guide (Production)

**Complete guide for deploying your Next.js application on a VPS using Docker**

---

## 📋 What You'll Need

1. **VPS Server** (DigitalOcean, AWS EC2, Linode, Vultr, etc.)
   - Minimum: 2GB RAM, 2 CPU cores, 40GB storage
   - Recommended: 4GB RAM, 2 CPU cores, 80GB storage

2. **Domain Name** (optional but recommended)
   - Example: `garritwulf.com`

3. **SSH Access** to your VPS

4. **Clerk Production Keys**
   - Get from: https://dashboard.clerk.com

---

## 🚀 Part 1: Server Setup (One Time Only)

### Step 1: Connect to Your VPS

```bash
ssh root@your-server-ip
# or
ssh your-username@your-server-ip
```

### Step 2: Update System

```bash
# Update packages
apt update && apt upgrade -y

# Install essential tools
apt install -y curl git ufw
```

### Step 3: Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install -y docker-compose

# Start Docker
systemctl start docker
systemctl enable docker

# Verify installation
docker --version
docker-compose --version
```

### Step 4: Setup Firewall

```bash
# Allow SSH, HTTP, HTTPS
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS

# Enable firewall
ufw --force enable

# Check status
ufw status
```

### Step 5: Create Application User (Security Best Practice)

```bash
# Create user
adduser appuser

# Add to docker group
usermod -aG docker appuser

# Switch to app user
su - appuser
```

---

## 📦 Part 2: Deploy Your Application

### Step 1: Clone Your Repository

```bash
# Go to home directory
cd ~

# Clone your repo
git clone https://github.com/your-username/garritwulf-production.git
cd garritwulf-production
```

### Step 2: Create Production Environment File

Create `.env.production` file:

```bash
nano .env.production
```

Add these variables (copy and modify):

```bash
# ==================================
# PRODUCTION ENVIRONMENT
# ==================================

# App Settings
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Clerk - GET PRODUCTION KEYS FROM: https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_PRODUCTION_KEY
CLERK_SECRET_KEY=sk_live_YOUR_PRODUCTION_SECRET
CLERK_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Database (will be created by Docker)
DATABASE_URL=postgresql://garritwulf_user:CHANGE_THIS_PASSWORD_123@postgres:5432/garritwulf_db

# Redis (will be created by Docker)
REDIS_URL=redis://redis:6379

# MinIO Storage (will be created by Docker)
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_REGION=us-east-1
MINIO_ACCESS_KEY=garritwulf_minio_prod
MINIO_SECRET_KEY=CHANGE_THIS_SECRET_KEY_456
MINIO_USE_SSL=false
MINIO_BUCKET_NAME=garritwulf

# MinIO Root Credentials (for admin access)
MINIO_ROOT_USER=admin_user_prod
MINIO_ROOT_PASSWORD=CHANGE_THIS_ADMIN_PASSWORD_789

# Security Keys - Generate from: https://generate-random.org/encryption-key-generator
SETTINGS_ENCRYPTION_KEY=GENERATE_64_CHAR_RANDOM_STRING_HERE
NEXTAUTH_SECRET=GENERATE_RANDOM_SECRET_HERE

# PostgreSQL Credentials (for Docker)
POSTGRES_USER=garritwulf_user
POSTGRES_PASSWORD=CHANGE_THIS_PASSWORD_123
POSTGRES_DB=garritwulf_db
```

**Save file:** Press `CTRL+X`, then `Y`, then `Enter`

**⚠️ IMPORTANT:** Replace all `CHANGE_THIS_*` values with strong passwords!

### Step 3: Update Docker Compose for Production

Your `docker-compose.prod.yml` needs to use the `.env.production` file:

```bash
nano docker-compose.prod.yml
```

Make sure it looks like this:

```yaml
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
      - postgres
      - redis
      - minio
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
    volumes:
      - redis_data:/data
    networks:
      - garrit-network
    restart: unless-stopped
    command: redis-server --appendonly yes

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

### Step 4: Build and Start Services

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d --build

# This will take 5-10 minutes for first build
# Watch the build process
docker-compose -f docker-compose.prod.yml logs -f
```

### Step 5: Run Database Migrations

After containers are running:

```bash
# Wait 30 seconds for database to be ready
sleep 30

# Run migrations
docker-compose -f docker-compose.prod.yml exec nextjs-app npx prisma generate
docker-compose -f docker-compose.prod.yml exec nextjs-app npx prisma migrate deploy

# Setup MinIO bucket
docker-compose -f docker-compose.prod.yml exec nextjs-app npm run setup:minio

# Create super admin (optional)
docker-compose -f docker-compose.prod.yml exec nextjs-app npm run setup:super-admin
```

### Step 6: Verify Everything is Running

```bash
# Check all containers are up
docker-compose -f docker-compose.prod.yml ps

# Should see:
# nextjs-app - Up
# postgres   - Up (healthy)
# redis      - Up
# minio      - Up (healthy)

# Test the app
curl http://localhost:3000
# Should return HTML
```

---

## 🌐 Part 3: Setup Nginx Reverse Proxy (HTTPS)
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

---

## 🐛 Troubleshooting

### App won't start
```bash
# Check logs
docker-compose logs nextjs-app

# Check if all services are running
docker-compose ps

# Verify environment variables
docker-compose exec nextjs-app env | grep MINIO
```

### Database connection failed
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Test connection
docker-compose exec postgres psql -U postgres -d garritwulf -c "SELECT 1;"
```

### MinIO connection issues
```bash
# Check MinIO is running
docker-compose ps minio

# Access MinIO console
# http://localhost:9001

# Verify bucket exists
docker-compose exec minio mc ls local/garritwulf
```

---

## 📦 Docker Image Sizes

- **Development**: ~1.5GB (includes dev dependencies)
- **Production**: ~200MB (optimized standalone build)

---

## 🔐 Production Security Notes

1. **Never expose MinIO/PostgreSQL ports** in production
2. **Use Docker Secrets** for sensitive data
3. **Run containers as non-root** (already configured)
4. **Enable SSL** for all services
5. **Regular backups** of volumes

---

## 🌐 Reverse Proxy (Nginx/Traefik)

For production, use a reverse proxy:

```nginx
# Nginx example
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 💾 Volume Management

```bash
# Backup volumes
docker run --rm -v garrit-wulf-clone_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz /data

# Restore volumes
docker run --rm -v garrit-wulf-clone_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres-backup.tar.gz -C /

# List volumes
docker volume ls

# Remove unused volumes
docker volume prune
```

---

## 🎯 Next Steps

1. Test locally: `docker-compose up`
2. Verify all services: http://localhost:3000
3. Configure production `.env.docker`
4. Deploy to production: `docker-compose -f docker-compose.prod.yml up -d`
5. Set up monitoring and backups

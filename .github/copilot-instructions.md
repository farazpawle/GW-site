# Garrit & Wulf - Project Configuration & Deployment Guide

> **Purpose**: This file contains deployment configurations, credentials, and infrastructure details for AI assistants and developers working on this project.

---

## 🌐 Repository Information

- **GitHub Repository**: https://github.com/farazpawle/GW-site.git
- **Default Branch**: `master`
- **Repository Owner**: farazpawle

### Git Workflow
```bash
# Standard workflow
git add .
git commit -m "Your commit message"
git push origin master
```

---

## 🖥️ VPS Production Server

### Server Details
- **IP Address**: `147.93.105.118`
- **SSH User**: `root`
- **SSH Private Key Location**: `C:\Users\Faraz\.ssh\`
- **Domain**: https://garritwulf.com
- **Deployment Path**: `/opt/GarritWulf/app`

### SSH Connection Methods

#### Method 1: SSH MCP Tool (Recommended for AI Assistants)
```javascript
// Use mcp_ssh-vps_remote-ssh tool
{
  "host": "147.93.105.118",
  "user": "root",
  "command": "your-command-here",
  "privateKeyPath": "C:\\Users\\Faraz\\.ssh\\id_rsa" // or id_ed25519
}
```

#### Method 2: Manual SSH (PowerShell)
```powershell
ssh root@147.93.105.118
```

### Docker Containers on VPS
- **App Container**: `GW-nextjs` (Next.js application)
- **Database**: `GW-postgres` (PostgreSQL 16)
- **Storage**: `GW-minio` (MinIO S3-compatible)
- **Cache**: `GW-redis` (Redis 7)
- **Network**: `gw-network`

---

## 🚀 Deployment Process

### Full Deployment Workflow
```bash
# 1. Pull latest code on VPS
cd /opt/GarritWulf/app
git pull origin master

# 2. Stop and remove existing container
docker stop GW-nextjs
docker rm GW-nextjs

# 3. Rebuild Docker image
docker build -t app_nextjs-app .

# 4. Run new container
docker run -d \
  --name GW-nextjs \
  --network gw-network \
  -p 3000:3000 \
  --env-file .env.production \
  app_nextjs-app

# 5. Verify deployment
docker logs GW-nextjs
docker ps | grep GW-nextjs
```

### Quick Deployment (Single Command)
```bash
ssh root@147.93.105.118 "cd /opt/GarritWulf/app && git pull origin master && docker stop GW-nextjs && docker rm GW-nextjs && docker build -t app_nextjs-app . && docker run -d --name GW-nextjs --network gw-network -p 3000:3000 --env-file .env.production app_nextjs-app"
```

### Rollback to Previous Version
```bash
# On VPS
cd /opt/GarritWulf/app
git log --oneline -5  # Find commit hash
git checkout <commit-hash>
docker stop GW-nextjs && docker rm GW-nextjs
docker build -t app_nextjs-app .
docker run -d --name GW-nextjs --network gw-network -p 3000:3000 --env-file .env.production app_nextjs-app
```

---

## 🔐 Environment Variables & Credentials

### Local Development (`.env.local`)
```env
# Database
DATABASE_URL="postgresql://garritwulf_user:garritwulf_secure_pass_2025@localhost:5432/garritwulf_db"

# Redis
REDIS_URL="redis://localhost:6379"

# MinIO (S3-compatible storage)
MINIO_ENDPOINT="localhost"
MINIO_PORT="9000"
MINIO_ACCESS_KEY="garritwulf_minio"
MINIO_SECRET_KEY="garritwulf_minio_secure_2025"
MINIO_USE_SSL="false"
MINIO_BUCKET="garritwulf-media"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
```

### VPS Production (`.env.production`)
```env
# Database (PostgreSQL in Docker)
DATABASE_URL="postgresql://garritwulf_user:garritwulf_secure_pass_2025@GW-postgres:5432/garritwulf_db"

# Redis (Redis in Docker)
REDIS_URL="redis://GW-redis:6379"

# MinIO (MinIO in Docker)
MINIO_ENDPOINT="https://minio.garritwulf.com"
MINIO_PORT="443"
MINIO_ACCESS_KEY="garritwulf_minio"
MINIO_SECRET_KEY="garritwulf_minio_secure_2025"
MINIO_USE_SSL="true"
MINIO_BUCKET="garritwulf-media"

# Public URLs
NEXT_PUBLIC_BASE_URL="https://garritwulf.com"
```

### Database Credentials
- **PostgreSQL Username**: `garritwulf_user`
- **PostgreSQL Password**: `garritwulf_secure_pass_2025`
- **Database Name**: `garritwulf_db`
- **Port**: `5432`

### MinIO Credentials
- **Access Key**: `garritwulf_minio`
- **Secret Key**: `garritwulf_minio_secure_2025`
- **Bucket Name**: `garritwulf-media`
- **Console URL (VPS)**: https://minio-console.garritwulf.com
- **Public Endpoint (VPS)**: https://minio.garritwulf.com

---

## 🗄️ Database Operations

### Connect to PostgreSQL (Local)
```bash
docker exec -it GW-postgres psql -U garritwulf_user -d garritwulf_db
```

### Connect to PostgreSQL (VPS)
```bash
ssh root@147.93.105.118
docker exec -it GW-postgres psql -U garritwulf_user -d garritwulf_db
```

### Run Migrations
```bash
# Local
npx prisma migrate dev

# VPS (inside container)
docker exec -it GW-nextjs npx prisma migrate deploy
```

### Database Backup
```bash
# On VPS
docker exec GW-postgres pg_dump -U garritwulf_user garritwulf_db > backup_$(date +%Y%m%d).sql
```

---

## 📦 MinIO Storage

### Folder Structure
```
garritwulf-media/
├── products/       # Product images
├── categories/     # Category images
├── general/        # Logos, footer images, general assets
└── icons/          # Favicons and app icons
```

### Public Access
- **Public Proxy Endpoint**: `/api/media/public?key={key}`
- **Allowed Folders**: `products/`, `categories/`, `general/`, `icons/`
- **Security**: Whitelisted via `isAllowedPublicKey()` in `src/lib/minio-client.ts`

### MinIO CLI Commands (VPS)
```bash
# List files in bucket
docker exec GW-minio mc ls myminio/garritwulf-media/

# Create folder
docker exec GW-minio mc cp /tmp/empty.txt myminio/garritwulf-media/newfolder/.keep

# Delete file
docker exec GW-minio mc rm myminio/garritwulf-media/products/filename.jpg
```

---

## 🧪 Testing & Verification

### Health Checks
```bash
# Application health
curl https://garritwulf.com/api/health

# Container status
docker ps | grep GW-

# Application logs
docker logs GW-nextjs --tail 100 -f

# Database connection
docker exec GW-nextjs npx prisma db execute --stdin <<< "SELECT 1;"
```

### Test Scripts
```bash
# Logo visibility test
npx tsx scripts/test-logo-visibility.ts

# Carousel configuration debug
npx tsx scripts/debug-carousel.ts

# RBAC audit
npx tsx scripts/audit-rbac.ts
```

---

## 🏗️ Architecture Overview

### Local Development Stack (Docker Compose)
- **App**: Next.js 15.5.4 (http://localhost:3000)
- **Database**: PostgreSQL 16 (localhost:5432)
- **Cache**: Redis 7 (localhost:6379)
- **Storage**: MinIO (localhost:9000)

### Production Stack (VPS Docker)
- **App**: Docker container `GW-nextjs` → Nginx Proxy Manager → https://garritwulf.com
- **Database**: Docker container `GW-postgres` (internal network)
- **Cache**: Docker container `GW-redis` (internal network)
- **Storage**: Docker container `GW-minio` → https://minio.garritwulf.com

### Network Configuration
- **Docker Network**: `gw-network` (bridge)
- **Exposed Ports**: 
  - Next.js: 3000 (proxied by Nginx)
  - MinIO API: 9000 (proxied by Nginx)
  - MinIO Console: 9001 (proxied by Nginx)

---

## 🔧 Common Issues & Solutions

### Issue: MinIO "Access Key Id does not exist"
**Solution**: Verify `.env.local` has correct credentials:
```env
MINIO_ACCESS_KEY="garritwulf_minio"
MINIO_SECRET_KEY="garritwulf_minio_secure_2025"
```

### Issue: Logo images broken (403) when logged out
**Solution**: Logo visibility fix implemented (Nov 20, 2025)
- Server uses public proxy URLs: `/api/media/public?key=general/logo.png`
- No authentication required

### Issue: Database connection refused
**Solution**: 
1. Check container status: `docker ps | grep GW-postgres`
2. Restart if needed: `docker restart GW-postgres`
3. Verify credentials in `.env.local` or `.env.production`

### Issue: Docker build fails on VPS
**Solution**:
```bash
# Clear Docker cache
docker system prune -a -f
# Rebuild with no cache
docker build --no-cache -t app_nextjs-app .
```

---

## 📝 Important Notes

1. **Always test locally before VPS deployment**
   - Run `npm run build` to check for errors
   - Test with `npm run dev` 

2. **MinIO credentials must match**
   - Local: `garritwulf_minio` / `garritwulf_minio_secure_2025`
   - VPS: Same credentials

3. **Database migrations**
   - Use `prisma migrate dev` locally
   - Use `prisma migrate deploy` in production

4. **SSH Key Location**
   - Windows: `C:\Users\Faraz\.ssh\`
   - Look for: `id_rsa`, `id_ed25519`, or `id_ecdsa`

5. **Docker logs for debugging**
   - Always check logs after deployment: `docker logs GW-nextjs`

---

## 🔄 CI/CD Future Improvements

Consider implementing:
- GitHub Actions for automatic deployment
- Docker image versioning with tags
- Blue-green deployment strategy
- Automated database backups
- Health check monitoring
- Rollback automation

---

*Last Updated: November 20, 2025*
*Maintained by: Faraz Pawle*

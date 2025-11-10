# Docker Deployment Guide

## Quick Start

### 1. Start Docker Containers

```powershell
docker-compose up -d
```

### 2. Initialize Database & Services (FIRST TIME ONLY)

```powershell
# Wait 10 seconds for containers to be fully ready, then run:
.\scripts\docker-init.ps1
```

### 3. Create Your Admin Account

```powershell
docker-compose exec nextjs-app npx tsx scripts/setup-super-admin.ts --email=YOUR_EMAIL
```

### 4. Access Your Site

- **Website**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **MinIO Console**: http://localhost:9001
  - Username: `garritwulf_minio`
  - Password: `garritwulf_minio_secure_2025`

---

## Daily Development

### Start Services

```powershell
docker-compose up -d
```

### View Logs

```powershell
# All services
docker-compose logs -f

# Just Next.js app
docker-compose logs -f nextjs-app

# Just database
docker-compose logs -f postgres
```

### Stop Services

```powershell
docker-compose down
```

### Restart a Service

```powershell
docker-compose restart nextjs-app
```

---

## Database Commands

### Run Migrations

```powershell
docker-compose exec nextjs-app npx prisma migrate deploy
```

### Access Database

```powershell
docker-compose exec postgres psql -U garritwulf_user -d garritwulf_db
```

### Backup Database

```powershell
docker-compose exec postgres pg_dump -U garritwulf_user garritwulf_db > backup.sql
```

### Restore Database

```powershell
cat backup.sql | docker-compose exec -T postgres psql -U garritwulf_user -d garritwulf_db
```

---

## Troubleshooting

### Containers Won't Start

```powershell
# Stop everything
docker-compose down

# Remove volumes (WARNING: This deletes your data!)
docker-compose down -v

# Start fresh
docker-compose up -d

# Re-initialize
.\scripts\docker-init.ps1
```

### Database Connection Errors

```powershell
# Check if postgres is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Restart postgres
docker-compose restart postgres
```

### MinIO Not Working

```powershell
# Recreate the bucket
docker-compose exec nextjs-app npx tsx scripts/create-main-bucket.ts

# Check MinIO logs
docker-compose logs minio
```

### App Won't Load

```powershell
# Rebuild the app
docker-compose build nextjs-app

# Restart
docker-compose restart nextjs-app

# Check logs
docker-compose logs -f nextjs-app
```

---

## Key Differences: Dev Mode vs Docker

### Development Mode (Current Setup)

```powershell
# Start services only
docker-compose -f docker-compose.dev.yml up -d

# Run Next.js on your machine
npm run dev
```

- Database: localhost:5432
- MinIO: localhost:9000
- Redis: localhost:6379
- Next.js: Runs on your machine with hot reload

### Full Docker Mode

```powershell
# Start everything
docker-compose up -d
```

- Everything runs in Docker
- Uses Docker network (minio, postgres, redis)
- Slower hot reload (uses volumes)
- Closer to production

---

## Environment Variables

Docker uses environment variables from:

1. `.env.local` (loaded via `env_file`)
2. `environment:` section in `docker-compose.yml` (overrides .env.local)

Key variables:

- `DATABASE_URL`: postgres connection string
- `MINIO_ENDPOINT`: Set to "minio" in Docker, "localhost" in dev mode
- `MINIO_BUCKET_NAME`: garritwulf-media

---

## Production Deployment (VPS)

For production deployment on your VPS, see:

- `docs/06-Deployment/DOCKER-VPS-DEPLOYMENT.md`
- `docs/06-Deployment/DEPLOYMENT-CHECKLIST.md`

Key differences for production:

1. Use `docker-compose.prod.yml`
2. Set `NODE_ENV=production`
3. Use production Clerk keys (pk*live*...)
4. Set up Nginx reverse proxy
5. Configure SSL with Let's Encrypt

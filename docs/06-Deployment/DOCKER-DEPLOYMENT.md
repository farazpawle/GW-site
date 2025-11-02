# Docker Deployment Guide

## ✅ Configuration Status

Your Docker setup is now properly configured with:
- ✅ Next.js application (standalone build)
- ✅ PostgreSQL database
- ✅ Redis cache
- ✅ MinIO object storage (S3-compatible)
- ✅ Proper `.dockerignore` (excludes docs, memory-bank, etc.)

---

## 🚀 Quick Start

### Development Mode

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Access:**
- App: http://localhost:3000
- MinIO Console: http://localhost:9001 (minioadmin/minioadmin123)
- PostgreSQL: localhost:5432
- Redis: localhost:6379

---

### Production Mode

```bash
# 1. Create production environment file
cp .env.docker.example .env.docker
# Edit .env.docker with your production values

# 2. Build and start production
docker-compose -f docker-compose.prod.yml up -d --build

# 3. Run database migrations
docker-compose -f docker-compose.prod.yml exec nextjs-app npx prisma migrate deploy

# 4. Seed database (optional)
docker-compose -f docker-compose.prod.yml exec nextjs-app npm run seed
```

---

## 📋 Pre-Deployment Checklist

### 1. Environment Variables
- [ ] Copy `.env.docker.example` to `.env.docker`
- [ ] Update all `YOUR_*` placeholders with real values
- [ ] Set strong passwords for PostgreSQL and MinIO
- [ ] Configure Clerk keys (production keys)
- [ ] Set `NEXT_PUBLIC_APP_URL` to your domain

### 2. Security
- [ ] Change default database password
- [ ] Change MinIO root credentials
- [ ] Enable SSL for MinIO in production (MINIO_USE_SSL=true)
- [ ] Configure firewall rules (only expose ports 80, 443)
- [ ] Use secrets management (Docker Secrets or env files with restricted permissions)

### 3. Database
- [ ] Backup existing data if migrating
- [ ] Run migrations: `docker-compose exec nextjs-app npx prisma migrate deploy`
- [ ] Verify database connection

### 4. Storage
- [ ] Configure MinIO bucket policies
- [ ] Set up backup strategy for MinIO data
- [ ] Test file upload/download

---

## 🔧 Common Commands

```bash
# View logs
docker-compose logs -f nextjs-app

# Restart app only
docker-compose restart nextjs-app

# Run Prisma commands
docker-compose exec nextjs-app npx prisma studio
docker-compose exec nextjs-app npx prisma migrate deploy

# Access container shell
docker-compose exec nextjs-app sh

# Clean rebuild
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

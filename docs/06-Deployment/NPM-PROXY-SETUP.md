# Nginx Proxy Manager (NPM) Setup Guide

## Overview
This project is configured to work with **Nginx Proxy Manager** running on your VPS. The project does NOT include its own nginx container - it exposes the Next.js application directly on port 3000 for NPM to proxy.

## Architecture

```
Internet → NPM (Port 80/443) → Next.js App (Port 3000)
                               ↓
                        PostgreSQL (Port 5432)
                        Redis (Port 6379)
                        MinIO (Port 9000/9001)
```

## Docker Configuration

### Services Exposed:
- **Next.js Application**: `localhost:3000` (main application)
- **PostgreSQL**: `localhost:5432` (database - internal only)
- **Redis**: `localhost:6379` (cache - internal only)
- **MinIO API**: `localhost:9000` (S3-compatible storage)
- **MinIO Console**: `localhost:9001` (web UI for storage management)

### Removed Services:
- ❌ **nginx** - Removed from all docker-compose files (using NPM instead)

## NPM Configuration

### Step 1: Create Proxy Host in NPM

**Basic Settings:**
- **Domain Names**: `yourdomain.com`, `www.yourdomain.com`
- **Scheme**: `http`
- **Forward Hostname/IP**: `host.docker.internal` (if NPM is in Docker) OR `localhost`
- **Forward Port**: `3000`
- **Cache Assets**: ✅ Enabled
- **Block Common Exploits**: ✅ Enabled
- **Websockets Support**: ✅ Enabled (IMPORTANT for hot reload in dev)

**SSL Settings (if using SSL):**
- **SSL Certificate**: Request a new SSL certificate via Let's Encrypt
- **Force SSL**: ✅ Enabled
- **HTTP/2 Support**: ✅ Enabled
- **HSTS Enabled**: ✅ Enabled (if production)

### Step 2: Advanced Configuration (Optional)

Add this to the **Custom Nginx Configuration** section in NPM:

```nginx
# Increase client body size for image uploads
client_max_body_size 50M;

# Proxy headers for Next.js
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header Host $host;

# WebSocket support for development hot reload
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";

# Timeout settings for long-running requests
proxy_connect_timeout 60s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;
```

### Step 3: MinIO Public Access (Optional)

If you need external access to MinIO (for image uploads from external sources):

**Create a second Proxy Host:**
- **Domain Names**: `storage.yourdomain.com`
- **Forward Hostname/IP**: `localhost`
- **Forward Port**: `9000`
- **SSL Certificate**: Use Let's Encrypt

## Deployment Commands

### Development (with hot reload):
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### Production:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Stop all services:
```bash
docker-compose down
```

### View logs:
```bash
docker-compose logs -f nextjs-app
```

## Network Configuration

### If NPM is in Docker:
You may need to connect NPM and this project to the same Docker network:

```bash
# Create a shared network
docker network create npm-network

# Connect NPM container to the network
docker network connect npm-network <npm-container-name>

# Update docker-compose.yml to use the external network
```

Then add to your docker-compose.yml:
```yaml
networks:
  garrit-network:
    external: true
    name: npm-network
```

### If NPM is on host:
Use `localhost:3000` or `127.0.0.1:3000` in NPM proxy settings.

## Environment Variables

Make sure these are set in your `.env` file:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/garritwulf

# Redis
REDIS_URL=redis://localhost:6379

# MinIO (if using from external)
MINIO_ENDPOINT=storage.yourdomain.com  # Or localhost:9000
MINIO_ACCESS_KEY=your_access_key
MINIO_SECRET_KEY=your_secret_key
MINIO_USE_SSL=true  # If using SSL via NPM

# Next.js
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Testing the Setup

### 1. Check Next.js is running:
```bash
curl http://localhost:3000
```

### 2. Check from NPM:
Visit your domain in a browser. You should see the website.

### 3. Check WebSocket (hot reload in dev):
Make a change to any file and verify hot reload works.

### 4. Check image uploads:
Upload a product image in admin panel and verify it appears correctly.

## Troubleshooting

### Issue: "502 Bad Gateway"
**Cause**: NPM can't reach the Next.js app
**Solution**: 
- Check if Next.js is running: `docker-compose ps`
- Verify the forward hostname/port in NPM
- Check Docker network connectivity

### Issue: Hot reload not working in development
**Cause**: WebSocket connection failing
**Solution**: Enable "Websockets Support" in NPM proxy settings

### Issue: Image uploads fail
**Cause**: Request body size limit
**Solution**: Add `client_max_body_size 50M;` to NPM custom config

### Issue: "Cannot connect to database"
**Cause**: Database connection string incorrect
**Solution**: Use `localhost:5432` if connecting from host, or `postgres:5432` from within Docker

## Files Modified

### Removed nginx service from:
- ✅ `docker-compose.yml`
- ✅ `docker-compose.prod.yml`

### nginx.conf files:
- Added to `.gitignore` (no longer needed)
- Can be deleted from project

## Security Notes

1. **Never expose PostgreSQL and Redis ports externally** - they should only be accessible via localhost
2. **Always use SSL in production** - Configure Let's Encrypt via NPM
3. **Set strong passwords** - Update default passwords in docker-compose files
4. **Limit MinIO access** - Only expose if external uploads are required
5. **Use environment variables** - Never commit secrets to git

## Next Steps

1. ✅ Remove nginx service from docker-compose files
2. ✅ Add nginx files to .gitignore
3. ⬜ Configure NPM proxy host pointing to `localhost:3000`
4. ⬜ Test the setup with your domain
5. ⬜ Configure SSL via Let's Encrypt in NPM
6. ⬜ Update environment variables with production values
7. ⬜ Deploy with `docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d`

---

**Status**: NPM-ready configuration complete ✅
**Last Updated**: October 10, 2025

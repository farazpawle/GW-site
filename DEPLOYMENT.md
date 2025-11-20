# Deployment Guide

## Production Deployment on VPS

This file ensures your data persists across all deployments.

### Key Configuration

The `docker-compose.prod.yml` uses **external volumes** that are never deleted:
- `gw_postgres_data` - Database data
- `gw_redis_data` - Cache data
- `gw_minio_data` - Uploaded images/files

### Deployment Steps

1. **Push code to GitHub:**
   ```bash
   git add .
   git commit -m "Your message"
   git push origin master
   ```

2. **On VPS, pull and rebuild:**
   ```bash
   cd /opt/GarritWulf
   git pull origin master
   docker compose -f docker-compose.prod.yml up -d --build nextjs-app
   ```

### Important Notes

- **Data Safety**: The `external: true` flag ensures volumes are never deleted, even when running `docker compose down`
- **Volume Names**: Always use `gw_*` prefix for production volumes
- **First Time Setup**: If volumes don't exist, create them first:
  ```bash
  docker volume create gw_postgres_data
  docker volume create gw_redis_data
  docker volume create gw_minio_data
  ```

### Emergency Data Recovery

If you accidentally deleted containers:
```bash
docker compose -f docker-compose.prod.yml up -d
```

Your data in the volumes will be preserved and reconnected.

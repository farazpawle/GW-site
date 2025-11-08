# Docker Setup Script - Run ONCE after starting docker-compose up
# This script initializes the database and MinIO for full Docker deployment

Write-Host "Initializing Docker environment..." -ForegroundColor Cyan
Write-Host ""

# Wait for services to be ready
Write-Host "Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Run migrations
Write-Host ""
Write-Host "Running database migrations..." -ForegroundColor Green
docker-compose exec -T nextjs-app npx prisma migrate deploy

# Seed database
Write-Host ""
Write-Host "Seeding database with initial data..." -ForegroundColor Green
docker-compose exec -T nextjs-app npx tsx scripts/seed-settings.ts
docker-compose exec -T nextjs-app npx tsx scripts/seed-default-pages.ts
docker-compose exec -T nextjs-app npx tsx scripts/seed-default-menu-items.ts

# Create MinIO bucket
Write-Host ""
Write-Host "Creating MinIO bucket..." -ForegroundColor Green
docker-compose exec -T nextjs-app npx tsx scripts/create-main-bucket.ts

Write-Host ""
Write-Host "Docker environment initialized successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Access the website: http://localhost:3000"
Write-Host "2. Sign in: http://localhost:3000/sign-in"
Write-Host "3. Run this to make yourself admin:"
Write-Host "   docker-compose exec nextjs-app npx tsx scripts/setup-super-admin.ts --email=YOUR_EMAIL"
Write-Host ""

#!/bin/bash

# Docker Setup Script - Run ONCE after starting docker-compose up
# This script initializes the database and MinIO for full Docker deployment

echo "🚀 Initializing Docker environment..."
echo ""

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 5

# Run migrations
echo ""
echo "📦 Running database migrations..."
docker-compose exec -T nextjs-app npx prisma migrate deploy

# Seed database
echo ""
echo "🌱 Seeding database with initial data..."
docker-compose exec -T nextjs-app npx tsx scripts/seed-settings.ts
docker-compose exec -T nextjs-app npx tsx scripts/seed-default-pages.ts
docker-compose exec -T nextjs-app npx tsx scripts/seed-default-menu-items.ts

# Create MinIO bucket
echo ""
echo "📂 Creating MinIO bucket..."
docker-compose exec -T nextjs-app npx tsx scripts/create-main-bucket.ts

echo ""
echo "✅ Docker environment initialized successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Access the website: http://localhost:3000"
echo "2. Sign in: http://localhost:3000/sign-in"
echo "3. Run this to make yourself admin:"
echo "   docker-compose exec nextjs-app npx tsx scripts/setup-super-admin.ts --email=YOUR_EMAIL"
echo ""

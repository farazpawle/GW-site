# Development stage
FROM node:18-alpine AS development
WORKDIR /app

# Install dependencies for native modules (Prisma, sharp, etc.)
RUN apk add --no-cache libc6-compat openssl

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy prisma schema for client generation
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]

# Builder stage - Creates optimized production build
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat openssl

# Copy package files and install ALL dependencies (including devDependencies for build)
COPY package*.json ./
RUN npm ci

# Copy prisma schema and generate client BEFORE copying rest of code
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source code (respects .dockerignore)
COPY . .

# Build the application
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production stage - Minimal runtime image
FROM node:18-alpine AS production
WORKDIR /app

# Install runtime dependencies and Prisma CLI for migrations
RUN apk add --no-cache libc6-compat openssl

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Copy standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Install ONLY production dependencies and Prisma CLI for migrations
RUN npm ci --only=production && \
    npx prisma generate && \
    npm cache clean --force

# Switch to non-root user
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Healthcheck to verify container is responsive
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

CMD ["node", "server.js"]
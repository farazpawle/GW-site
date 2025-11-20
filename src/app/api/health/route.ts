import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Health Check Endpoint
 * 
 * Verifies that the application is running and core services are accessible.
 * Used for:
 * - Deployment verification
 * - Uptime monitoring
 * - Load balancer health checks
 * - Quick diagnostics
 * 
 * Returns:
 * - 200: Application healthy, all checks passed
 * - 503: Application unhealthy, one or more checks failed
 * 
 * Example response:
 * ```json
 * {
 *   "status": "healthy",
 *   "timestamp": "2024-11-02T10:30:00.000Z",
 *   "uptime": 12345.67,
 *   "checks": {
 *     "database": "connected",
 *     "environment": "production"
 *   }
 * }
 * ```
 */
export async function GET() {
  const startTime = Date.now();
  
  const healthStatus = {
    status: 'healthy' as 'healthy' | 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: 'unknown' as 'connected' | 'disconnected' | 'unknown',
      environment: process.env.NODE_ENV || 'unknown',
    },
    responseTime: 0,
  };

  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    healthStatus.checks.database = 'connected';
  } catch (error) {
    console.error('Health check: Database connection failed', error);
    healthStatus.checks.database = 'disconnected';
    healthStatus.status = 'unhealthy';
  }

  // Calculate response time
  healthStatus.responseTime = Date.now() - startTime;

  // Return appropriate status code
  const statusCode = healthStatus.status === 'healthy' ? 200 : 503;

  return NextResponse.json(healthStatus, { status: statusCode });
}

/**
 * Detailed Health Check Endpoint
 * 
 * Provides more detailed information about system health.
 * Should be protected in production (e.g., require authentication or IP whitelist).
 * 
 * Usage: GET /api/health?detailed=true
 */
export async function HEAD() {
  // Simple ping endpoint for load balancers
  // Just returns 200 OK without body
  try {
    await prisma.$queryRaw`SELECT 1`;
    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}

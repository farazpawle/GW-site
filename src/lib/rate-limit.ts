/**
 * Rate Limiting Utilities
 * 
 * Provides in-memory rate limiting for API endpoints to prevent abuse.
 * 
 * NOTE: For production with multiple servers, consider using Redis-based
 * rate limiting (@upstash/ratelimit) for distributed rate limiting.
 * 
 * This implementation uses in-memory storage which works for:
 * - Single server deployments
 * - Development environments
 * - Small to medium traffic applications
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory storage for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Rate limiter configuration
 */
export interface RateLimitConfig {
  /** Maximum number of requests allowed */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Custom identifier (defaults to IP address) */
  keyPrefix?: string;
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  /** Whether the request is allowed */
  success: boolean;
  /** Remaining requests in current window */
  remaining: number;
  /** Time until rate limit resets (in milliseconds) */
  resetTime: number;
  /** Total requests allowed */
  limit: number;
}

/**
 * Check if request is within rate limit
 * 
 * @param identifier - Unique identifier (usually IP address)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 * 
 * @example
 * const ip = request.ip ?? '127.0.0.1';
 * const result = checkRateLimit(ip, { maxRequests: 10, windowMs: 60000 });
 * if (!result.success) {
 *   return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
 * }
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const key = config.keyPrefix ? `${config.keyPrefix}:${identifier}` : identifier;
  const now = Date.now();
  
  // Get or create entry
  let entry = rateLimitStore.get(key);
  
  // If no entry or window expired, create new one
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);
  }
  
  // Increment counter
  entry.count++;
  
  // Check if limit exceeded
  const success = entry.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - entry.count);
  
  return {
    success,
    remaining,
    resetTime: entry.resetTime - now,
    limit: config.maxRequests,
  };
}

/**
 * Preset rate limiters for common use cases
 */

/**
 * Strict rate limiter for authentication endpoints
 * 5 requests per 15 minutes per IP
 */
export const authRateLimiter = {
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  keyPrefix: 'auth',
};

/**
 * Standard rate limiter for general API endpoints
 * 100 requests per 15 minutes per IP
 */
export const apiRateLimiter = {
  maxRequests: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
  keyPrefix: 'api',
};

/**
 * Contact form rate limiter
 * 3 submissions per hour per IP
 */
export const contactRateLimiter = {
  maxRequests: 3,
  windowMs: 60 * 60 * 1000, // 1 hour
  keyPrefix: 'contact',
};

/**
 * Search rate limiter
 * 50 searches per 5 minutes per IP
 */
export const searchRateLimiter = {
  maxRequests: 50,
  windowMs: 5 * 60 * 1000, // 5 minutes
  keyPrefix: 'search',
};

/**
 * File upload rate limiter
 * 10 uploads per hour per IP
 */
export const uploadRateLimiter = {
  maxRequests: 10,
  windowMs: 60 * 60 * 1000, // 1 hour
  keyPrefix: 'upload',
};

/**
 * Generous rate limiter for public endpoints
 * 200 requests per 15 minutes per IP
 */
export const publicRateLimiter = {
  maxRequests: 200,
  windowMs: 15 * 60 * 1000, // 15 minutes
  keyPrefix: 'public',
};

/**
 * Get client IP address from request headers
 * Handles various proxy configurations
 * 
 * @param request - Next.js request object
 * @returns IP address string
 */
export function getClientIP(request: Request): string {
  // Try various headers in order of preference
  const headers = new Headers(request.headers);
  
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = headers.get('x-real-ip');
  if (realIP) {
    return realIP.trim();
  }
  
  const cfConnectingIP = headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP.trim();
  }
  
  // Fallback to localhost (useful for development)
  return '127.0.0.1';
}

/**
 * Create rate limit response with headers
 * 
 * @param result - Rate limit check result
 * @returns Response headers object
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(Date.now() + result.resetTime).toISOString(),
    'Retry-After': Math.ceil(result.resetTime / 1000).toString(),
  };
}

/**
 * Middleware helper to apply rate limiting
 * 
 * @param request - Next.js request object
 * @param config - Rate limit configuration
 * @returns Response if rate limited, null if allowed
 * 
 * @example
 * export async function POST(request: NextRequest) {
 *   const rateLimitResponse = await applyRateLimit(request, contactRateLimiter);
 *   if (rateLimitResponse) return rateLimitResponse;
 *   
 *   // Continue with normal request handling
 * }
 */
export function applyRateLimit(
  request: Request,
  config: RateLimitConfig
): Response | null {
  const ip = getClientIP(request);
  const result = checkRateLimit(ip, config);
  
  if (!result.success) {
    const headers = getRateLimitHeaders(result);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Too many requests',
        message: 'You have exceeded the rate limit. Please try again later.',
        retryAfter: Math.ceil(result.resetTime / 1000),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      }
    );
  }
  
  return null;
}

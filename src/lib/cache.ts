import { Redis } from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
});

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 60
): Promise<T> {
  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.error("[Cache] Redis get error:", error);
  }

  const data = await fetcher();

  try {
    await redis.setex(key, ttl, JSON.stringify(data));
  } catch (error) {
    console.error("[Cache] Redis set error:", error);
  }

  return data;
}

/**
 * Clear a single cache key
 * @param key - Cache key to delete
 * @returns Number of keys deleted (0 or 1)
 */
export async function clearCache(key: string): Promise<number> {
  try {
    const result = await redis.del(key);
    console.log(`[Cache] Cleared key: ${key} (deleted: ${result})`);
    return result;
  } catch (error) {
    console.error(`[Cache] Error clearing key ${key}:`, error);
    return 0;
  }
}

/**
 * Clear all cache keys matching a pattern
 * Uses SCAN to avoid blocking Redis
 * @param pattern - Pattern to match (e.g., "products:*")
 * @returns Number of keys deleted
 */
export async function clearPattern(pattern: string): Promise<number> {
  try {
    const keys: string[] = [];
    
    // Use SCAN to find matching keys without blocking
    const stream = redis.scanStream({
      match: pattern,
      count: 100,
    });

    // Collect all matching keys
    await new Promise<void>((resolve, reject) => {
      stream.on('data', (resultKeys: string[]) => {
        keys.push(...resultKeys);
      });
      stream.on('end', () => resolve());
      stream.on('error', (err) => reject(err));
    });

    // Delete all matching keys if any found
    if (keys.length > 0) {
      const result = await redis.del(...keys);
      console.log(`[Cache] Cleared pattern: ${pattern} (deleted: ${result} keys)`);
      return result;
    }

    console.log(`[Cache] No keys found for pattern: ${pattern}`);
    return 0;
  } catch (error) {
    console.error(`[Cache] Error clearing pattern ${pattern}:`, error);
    return 0;
  }
}

export { redis };

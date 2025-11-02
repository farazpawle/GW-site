import { SettingsCategory, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { encryptValue, decryptValue, isSensitiveField } from './encryption';

/**
 * Cache entry structure with timestamp for TTL
 */
interface CacheEntry {
  data: string | Record<string, string> | null;
  timestamp: number;
}

/**
 * In-memory cache for settings
 * Key format: "all", "GENERAL", "site_name", etc.
 */
const settingsCache = new Map<string, CacheEntry>();

/**
 * Cache TTL in milliseconds (60 seconds)
 */
const CACHE_TTL = 60000;

/**
 * Check if cache entry is still valid
 */
function isCacheValid(entry: CacheEntry | undefined): boolean {
  if (!entry) return false;
  return Date.now() - entry.timestamp < CACHE_TTL;
}

/**
 * Get a single setting by key
 * Uses cache with 60s TTL, automatically decrypts sensitive fields
 * 
 * @param key - The setting key to retrieve
 * @returns The setting value or null if not found
 */
export async function getSetting(key: string): Promise<string | null> {
  // Check cache first
  const cacheKey = key;
  const cached = settingsCache.get(cacheKey);
  
  if (isCacheValid(cached) && cached) {
    return cached.data as string | null;
  }
  
  try {
    // Fetch from database
    const setting = await prisma.settings.findUnique({
      where: { key },
    });
    
    if (!setting) {
      return null;
    }
    
    // Decrypt if sensitive field
    let value = setting.value;
    if (isSensitiveField(key)) {
      try {
        value = decryptValue(value);
      } catch (error) {
        console.error(`Failed to decrypt setting "${key}":`, error);
        return null;
      }
    }
    
    // Cache the result
    settingsCache.set(cacheKey, {
      data: value,
      timestamp: Date.now(),
    });
    
    return value;
  } catch (error) {
    console.error(`Error fetching setting "${key}":`, error);
    return null;
  }
}

/**
 * Get all settings or filter by category
 * Returns key-value object, automatically decrypts sensitive fields
 * 
 * @param category - Optional category filter
 * @returns Object with setting key-value pairs
 */
export async function getSettings(
  category?: SettingsCategory
): Promise<Record<string, string>> {
  // Check cache first
  const cacheKey = category || 'all';
  const cached = settingsCache.get(cacheKey);
  
  if (isCacheValid(cached) && cached) {
    return cached.data as Record<string, string>;
  }
  
  try {
    // Fetch from database
    const settings = await prisma.settings.findMany({
      where: category ? { category } : undefined,
      orderBy: { key: 'asc' },
    });
    
    // Convert to key-value object and decrypt sensitive fields
    const settingsObj: Record<string, string> = {};
    
    for (const setting of settings) {
      let value = setting.value;
      
      // Decrypt if sensitive field
      if (isSensitiveField(setting.key)) {
        try {
          value = decryptValue(value);
        } catch (error) {
          console.error(`Failed to decrypt setting "${setting.key}":`, error);
          continue; // Skip this setting
        }
      }
      
      settingsObj[setting.key] = value;
    }
    
    // Cache the result
    settingsCache.set(cacheKey, {
      data: settingsObj,
      timestamp: Date.now(),
    });
    
    return settingsObj;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return {};
  }
}

/**
 * Update a single setting
 * Automatically encrypts sensitive fields, clears cache
 * 
 * @param key - The setting key
 * @param value - The new value
 * @param userId - ID of user making the change
 * @param category - Category for new settings (required if creating)
 * @returns Updated setting or null on error
 */
export async function updateSetting(
  key: string,
  value: string,
  userId?: string,
  category?: SettingsCategory
): Promise<{ key: string; value: string; category: SettingsCategory } | null> {
  try {
    // Encrypt if sensitive field
    let storedValue = value;
    if (isSensitiveField(key)) {
      storedValue = encryptValue(value);
    }
    
    // Upsert to database
    const setting = await prisma.settings.upsert({
      where: { key },
      update: {
        value: storedValue,
        updatedBy: userId,
      },
      create: {
        key,
        value: storedValue,
        category: category || SettingsCategory.GENERAL,
        updatedBy: userId,
      },
    });
    
    // Clear cache for this key
    settingsCache.delete(key);
    // Clear category cache
    settingsCache.delete(setting.category);
    // Clear 'all' cache
    settingsCache.delete('all');
    
    return {
      key: setting.key,
      value, // Return decrypted value
      category: setting.category,
    };
  } catch (error) {
    console.error(`Error updating setting "${key}":`, error);
    return null;
  }
}

/**
 * Bulk update multiple settings
 * Uses Prisma transaction for atomicity, automatically encrypts sensitive fields
 * 
 * @param updates - Object with key-value pairs to update
 * @param userId - ID of user making the changes
 * @returns Success status and number of updated settings
 */
export async function updateSettings(
  updates: Record<string, string>,
  userId?: string
): Promise<{ success: boolean; count: number; errors?: string[] }> {
  const errors: string[] = [];
  let count = 0;
  
  try {
    // Use transaction for atomic updates
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      for (const [key, value] of Object.entries(updates)) {
        try {
          // Encrypt if sensitive field
          let storedValue = value;
          if (isSensitiveField(key)) {
            storedValue = encryptValue(value);
          }
          
          // Get existing setting to determine category
          const existing = await tx.settings.findUnique({
            where: { key },
            select: { category: true },
          });
          
          // Upsert setting
          await tx.settings.upsert({
            where: { key },
            update: {
              value: storedValue,
              updatedBy: userId,
            },
            create: {
              key,
              value: storedValue,
              category: existing?.category || SettingsCategory.GENERAL,
              updatedBy: userId,
            },
          });
          
          count++;
        } catch (error) {
          const errorMsg = `Failed to update "${key}": ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.error(errorMsg);
        }
      }
    });
    
    // Clear entire cache after bulk update
    clearCache();
    
    return {
      success: errors.length === 0,
      count,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error('Error in bulk settings update:', error);
    return {
      success: false,
      count: 0,
      errors: [error instanceof Error ? error.message : 'Transaction failed'],
    };
  }
}

/**
 * Clear all cached settings
 * Use this after bulk updates or when cache needs to be refreshed
 */
export function clearCache(): void {
  settingsCache.clear();
}

/**
 * Get cache statistics (for debugging)
 */
export function getCacheStats(): {
  size: number;
  keys: string[];
} {
  return {
    size: settingsCache.size,
    keys: Array.from(settingsCache.keys()),
  };
}

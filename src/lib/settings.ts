import { prisma } from '@/lib/prisma'

/**
 * In-memory cache for site settings
 * Cache expires after 60 seconds (1 minute)
 */
interface SettingsCache {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Map<string, any>
  timestamp: number
}

const cache: SettingsCache = {
  data: new Map(),
  timestamp: 0,
}

const CACHE_DURATION = 60000 // 60 seconds (1 minute)

/**
 * Check if the cache is still valid
 */
function isCacheValid(): boolean {
  return Date.now() - cache.timestamp < CACHE_DURATION
}

/**
 * Get a site setting by key
 * Uses in-memory cache with 60-second TTL to reduce database hits
 * 
 * @param key - The setting key (e.g., 'ecommerce_enabled', 'currency')
 * @returns The setting value (JSON parsed) or null if not found
 * 
 * @example
 * const currency = await getSiteSetting('currency')
 * // Returns: { code: 'AED', symbol: 'AED', position: 'before' }
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getSiteSetting(key: string): Promise<any> {
  // Check if cache is valid and contains the key
  if (isCacheValid() && cache.data.has(key)) {
    return cache.data.get(key)
  }

  try {
    // Fetch from database
    const setting = await prisma.siteSettings.findUnique({
      where: { key },
    })

    if (!setting) {
      return null
    }

    // Update cache
    cache.data.set(key, setting.value)
    cache.timestamp = Date.now()

    return setting.value
  } catch (error) {
    console.error(`Error fetching setting "${key}":`, error)
    return null
  }
}

/**
 * Check if e-commerce mode is enabled
 * This is the primary function used throughout the application to determine
 * whether to show pricing, stock, and shopping cart features
 * 
 * @returns true if e-commerce is enabled, false otherwise (defaults to false)
 * 
 * @example
 * const showPricing = await isEcommerceEnabled()
 * if (showPricing) {
 *   // Show price, "Add to Cart" button
 * } else {
 *   // Show "Contact Us" button instead
 * }
 */
export async function isEcommerceEnabled(): Promise<boolean> {
  const setting = await getSiteSetting('ecommerce_enabled')
  
  // Handle both boolean and legacy object format
  if (typeof setting === 'boolean') {
    return setting
  }
  
  // Legacy format: { enabled: boolean, enabledAt: string | null }
  return setting?.enabled || false
}

/**
 * Get currency settings
 * 
 * @returns Currency configuration object with code, symbol, and position
 */
export async function getCurrencySettings(): Promise<{
  code: string
  symbol: string
  position: 'before' | 'after'
}> {
  const setting = await getSiteSetting('currency')
  return setting || { code: 'AED', symbol: 'AED', position: 'before' }
}

/**
 * Get contact information settings
 * 
 * @returns Contact info object with email, phone, and whatsapp
 */
export async function getContactInfo(): Promise<{
  email: string
  phone: string
  whatsapp: string
}> {
  const setting = await getSiteSetting('contact_info')
  return setting || {
    email: 'info@garritwulf.com',
    phone: '+971502345678',
    whatsapp: '+971502345678',
  }
}

/**
 * Clear the settings cache
 * Call this function after updating settings to ensure fresh data is fetched
 * 
 * @example
 * // After updating settings in admin panel
 * await prisma.siteSettings.update({ ... })
 * clearSettingsCache()
 */
export function clearSettingsCache(): void {
  cache.data.clear()
  cache.timestamp = 0
}

/**
 * Prefetch all common settings into cache
 * Useful for warming up the cache on application start or after cache clear
 */
export async function prefetchSettings(): Promise<void> {
  try {
    const commonKeys = ['ecommerce_enabled', 'currency', 'contact_info']
    await Promise.all(commonKeys.map(key => getSiteSetting(key)))
  } catch (error) {
    console.error('Error prefetching settings:', error)
  }
}

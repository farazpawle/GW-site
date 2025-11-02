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
const PRODUCT_CARD_CACHE_DURATION = 5000 // 5 seconds for product card settings (faster updates)

/**
 * Check if the cache is still valid
 * @param isProductCardSetting - Whether this is a product card setting (uses shorter TTL)
 */
function isCacheValid(isProductCardSetting = false): boolean {
  const duration = isProductCardSetting ? PRODUCT_CARD_CACHE_DURATION : CACHE_DURATION;
  return Date.now() - cache.timestamp < duration;
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
  // Check if this is a product card setting (uses shorter cache TTL)
  const isProductCardSetting = key.startsWith('product_card_');
  
  // Check if cache is valid and contains the key
  if (isCacheValid(isProductCardSetting) && cache.data.has(key)) {
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
 * Get product card display settings
 * Controls which fields are visible on product cards throughout the site
 * Reads from individual product_card_* settings keys
 * 
 * @returns Product card display configuration
 */
export async function getProductCardSettings(): Promise<{
  showPrice: boolean
  showComparePrice: boolean
  showPartNumber: boolean
  showSku: boolean
  showBrand: boolean
  showOrigin: boolean
  showCategory: boolean
  showDescription: boolean
  showTags: boolean
  showStockStatus: boolean
  showDiscountBadge: boolean
  showCertifications: boolean
  showWarranty: boolean
  showApplication: boolean
  showSpecifications: boolean
  showCompatibility: boolean
}> {
  // Helper to get boolean setting with default true
  const getBoolSetting = async (key: string): Promise<boolean> => {
    const value = await getSiteSetting(key)
    if (value === null || value === undefined || value === '') return true
    return value === 'true' || value === true
  }

  // Fetch all individual settings
  const [
    showPrice,
    showComparePrice,
    showPartNumber,
    showSku,
    showBrand,
    showOrigin,
    showCategory,
    showDescription,
    showTags,
    showStockStatus,
    showDiscountBadge,
    showCertifications,
    showWarranty,
    showApplication,
    showSpecifications,
    showCompatibility,
  ] = await Promise.all([
    getBoolSetting('product_card_showPrice'),
    getBoolSetting('product_card_showComparePrice'),
    getBoolSetting('product_card_showPartNumber'),
    getBoolSetting('product_card_showSku'),
    getBoolSetting('product_card_showBrand'),
    getBoolSetting('product_card_showOrigin'),
    getBoolSetting('product_card_showCategory'),
    getBoolSetting('product_card_showDescription'),
    getBoolSetting('product_card_showTags'),
    getBoolSetting('product_card_showStockStatus'),
    getBoolSetting('product_card_showDiscountBadge'),
    getBoolSetting('product_detail_showCertifications'),
    getBoolSetting('product_detail_showWarranty'),
    getBoolSetting('product_detail_showApplication'),
    getBoolSetting('product_detail_showSpecifications'),
    getBoolSetting('product_detail_showCompatibility'),
  ])

  return {
    showPrice,
    showComparePrice,
    showPartNumber,
    showSku,
    showBrand,
    showOrigin,
    showCategory,
    showDescription,
    showTags,
    showStockStatus,
    showDiscountBadge,
    showCertifications,
    showWarranty,
    showApplication,
    showSpecifications,
    showCompatibility,
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
    const commonKeys = [
      'ecommerce_enabled',
      'currency',
      'contact_info',
      // Product card settings
      'product_card_showPrice',
      'product_card_showComparePrice',
      'product_card_showPartNumber',
      'product_card_showSku',
      'product_card_showBrand',
      'product_card_showOrigin',
      'product_card_showCategory',
      'product_card_showDescription',
      'product_card_showTags',
      'product_card_showStockStatus',
      'product_card_showDiscountBadge',
    ]
    await Promise.all(commonKeys.map(key => getSiteSetting(key)))
  } catch (error) {
    console.error('Error prefetching settings:', error)
  }
}

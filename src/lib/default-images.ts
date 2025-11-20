/**
 * Default images configuration for the application
 */

export const DEFAULT_IMAGES = {
  PRODUCT: '/images/placeholder-product-white.svg',
  PRODUCT_SVG: '/images/placeholder-product.svg',
  LOGO: '/images/default-logo.png',
} as const;

/**
 * Get product image with fallback to default
 * @param images - Array of product image URLs
 * @param index - Index of the image to get (default: 0)
 * @returns Image URL or default placeholder
 */
export function getProductImage(images: string[] | null | undefined, index = 0): string {
  if (!images || images.length === 0) {
    return DEFAULT_IMAGES.PRODUCT;
  }
  
  const image = images[index];
  return image || DEFAULT_IMAGES.PRODUCT;
}

/**
 * Get all product images with at least one default
 * @param images - Array of product image URLs
 * @returns Array with images or default placeholder
 */
export function getProductImages(images: string[] | null | undefined): string[] {
  if (!images || images.length === 0) {
    return [DEFAULT_IMAGES.PRODUCT];
  }
  
  return images.filter(Boolean);
}

/**
 * Check if image is the default placeholder
 * @param imageUrl - Image URL to check
 * @returns true if image is default placeholder
 */
export function isDefaultImage(imageUrl: string): boolean {
  return imageUrl === DEFAULT_IMAGES.PRODUCT || imageUrl === DEFAULT_IMAGES.PRODUCT_SVG;
}

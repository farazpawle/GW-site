/**
 * Application-wide constants
 */

// Default images for when no image is provided
export const DEFAULT_IMAGES = {
  product: '/images/GW_LOGO-removebg.png',
  category: '/images/GW_LOGO-removebg.png',
  user: '/images/GW_LOGO-removebg.png',
} as const;

// Helper function to get default image
export function getDefaultImage(type: keyof typeof DEFAULT_IMAGES): string {
  return DEFAULT_IMAGES[type];
}

// Helper function to get image with fallback
export function getImageWithFallback(
  imageUrl: string | null | undefined,
  type: keyof typeof DEFAULT_IMAGES
): string {
  return imageUrl || DEFAULT_IMAGES[type];
}

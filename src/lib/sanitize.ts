/**
 * HTML Sanitization Utilities
 * 
 * Provides safe HTML rendering for user-generated content (CMS pages)
 * Uses regex-based sanitization to prevent XSS attacks
 */

/**
 * Sanitize HTML content to prevent XSS attacks
 * 
 * Removes potentially dangerous elements like script tags, event handlers,
 * and unsafe attributes while preserving safe HTML formatting
 * 
 * @param html - Raw HTML string from database or user input
 * @returns Sanitized HTML safe for rendering
 * 
 * @example
 * const safeHTML = sanitizeHTML(page.content);
 * <div dangerouslySetInnerHTML={{ __html: safeHTML }} />
 */
export function sanitizeHTML(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Remove dangerous tags and attributes
  const cleaned = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers like onclick
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, ''); // Remove dangerous data URIs
  
  return cleaned;
}

/**
 * Sanitize HTML for structured data (JSON-LD)
 * More restrictive - removes all HTML tags
 * 
 * @param html - Raw HTML string
 * @returns Plain text without HTML tags
 */
export function sanitizeForStructuredData(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Strip all HTML tags and return plain text
 * Useful for meta descriptions, search previews, etc.
 * 
 * @param html - Raw HTML string
 * @returns Plain text without any HTML
 */
export function stripHTML(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  return html
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Sanitize HTML but preserve more formatting (for admin preview)
 * Same as sanitizeHTML but can be extended for additional features
 * 
 * @param html - Raw HTML string
 * @returns Sanitized HTML with extended tag support
 */
export function sanitizeHTMLExtended(html: string): string {
  return sanitizeHTML(html);
}

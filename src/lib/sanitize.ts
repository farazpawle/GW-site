/**
 * HTML Sanitization Utilities
 * 
 * Provides safe HTML rendering for user-generated content (CMS pages)
 * Uses DOMPurify to prevent XSS attacks while allowing safe HTML tags
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * 
 * Allows common formatting tags but strips potentially dangerous elements
 * like script tags, event handlers, and unsafe attributes
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

  return DOMPurify.sanitize(html, {
    // Allow common HTML tags for rich text content
    ALLOWED_TAGS: [
      // Text formatting
      'p', 'br', 'span', 'strong', 'b', 'em', 'i', 'u', 's', 'mark', 'small', 'sub', 'sup',
      // Headings
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      // Lists
      'ul', 'ol', 'li',
      // Links
      'a',
      // Blocks
      'div', 'section', 'article', 'blockquote', 'pre', 'code',
      // Tables
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      // Media (controlled)
      'img',
      // Other
      'hr',
    ],

    // Allow safe attributes only
    ALLOWED_ATTR: [
      'href', 'target', 'rel', // Links
      'src', 'alt', 'width', 'height', // Images
      'class', 'id', // Styling/targeting
      'title', // Tooltips
      'colspan', 'rowspan', // Tables
    ],

    // Additional security settings
    ALLOW_DATA_ATTR: false, // Block data-* attributes
    ALLOW_UNKNOWN_PROTOCOLS: false, // Only allow http(s):, mailto:, tel:
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    
    // Force target="_blank" and rel="noopener noreferrer" for external links
    ADD_ATTR: ['target', 'rel'],
    
    // Remove unsafe protocols
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'], // Block event handlers
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
    
    // Keep safe HTML entities
    KEEP_CONTENT: true,
    
    // Return clean HTML
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  });
}

/**
 * Sanitize HTML for structured data (JSON-LD)
 * More restrictive than regular HTML sanitization
 * 
 * @param html - Raw HTML string
 * @returns Plain text with minimal formatting
 */
export function sanitizeForStructuredData(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  }).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
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

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true,
  });
}

/**
 * Sanitize HTML but preserve more formatting (for admin preview)
 * Still safe but allows more HTML elements
 * 
 * @param html - Raw HTML string
 * @returns Sanitized HTML with extended tag support
 */
export function sanitizeHTMLExtended(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'span', 'strong', 'b', 'em', 'i', 'u', 's', 'mark', 'small', 'sub', 'sup',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'a',
      'div', 'section', 'article', 'blockquote', 'pre', 'code',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'img', 'figure', 'figcaption',
      'hr', 'video', 'audio', 'source',
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel',
      'src', 'alt', 'width', 'height',
      'class', 'id', 'style',
      'title',
      'colspan', 'rowspan',
      'controls', 'autoplay', 'loop', 'muted',
    ],
    ALLOW_DATA_ATTR: true, // Allow data attributes for admin
    KEEP_CONTENT: true,
  });
}

/**
 * Search utility functions for query building, sanitization, and text processing
 */

import { Prisma } from '@prisma/client';

/**
 * Sanitize search input to prevent XSS attacks
 * Escapes HTML special characters
 */
export function sanitizeSearchInput(text: string): string {
  if (!text) return '';
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Parse and normalize URL search parameters
 */
export interface ParsedSearchParams {
  query: string;
  page: number;
  categoryIds: string[];
  brands: string[];
  tags: string[];
  minPrice: number | null;
  maxPrice: number | null;
  sort: string;
}

export function parseSearchParams(params: URLSearchParams): ParsedSearchParams {
  const query = sanitizeSearchInput(params.get('q') || '');
  const page = Math.max(1, parseInt(params.get('page') || '1', 10));
  
  // Parse array parameters
  const categoryIds = params.getAll('categoryId').filter(Boolean);
  const brands = params.getAll('brand').filter(Boolean);
  const tags = params.getAll('tags').filter(Boolean);
  
  // Parse price range
  const minPriceStr = params.get('minPrice');
  const maxPriceStr = params.get('maxPrice');
  const minPrice = minPriceStr ? parseFloat(minPriceStr) : null;
  const maxPrice = maxPriceStr ? parseFloat(maxPriceStr) : null;
  
  // Validate price range
  const validMinPrice = minPrice !== null && minPrice >= 0 && !isNaN(minPrice) ? minPrice : null;
  const validMaxPrice = maxPrice !== null && maxPrice >= 0 && !isNaN(maxPrice) ? maxPrice : null;
  
  // Parse sort parameter
  const sort = params.get('sort') || 'relevance';
  const validSortOptions = ['relevance', 'price-asc', 'price-desc', 'name-asc', 'name-desc', 'newest'];
  const validSort = validSortOptions.includes(sort) ? sort : 'relevance';
  
  return {
    query,
    page,
    categoryIds,
    brands,
    tags,
    minPrice: validMinPrice,
    maxPrice: validMaxPrice,
    sort: validSort,
  };
}

/**
 * Build Prisma WHERE clause from parsed search parameters
 */
export function buildSearchQuery(params: ParsedSearchParams): Prisma.PartWhereInput {
  const where: Prisma.PartWhereInput = {
    published: true,
  };
  
  // Search query - OR across multiple fields
  if (params.query) {
    where.OR = [
      { name: { contains: params.query, mode: 'insensitive' } },
      { partNumber: { contains: params.query, mode: 'insensitive' } },
      { description: { contains: params.query, mode: 'insensitive' } },
      { brand: { contains: params.query, mode: 'insensitive' } },
      { tags: { hasSome: [params.query.toLowerCase()] } },
      { compatibility: { hasSome: [params.query.toLowerCase()] } },
    ];
  }
  
  // Category filter
  if (params.categoryIds.length > 0) {
    where.categoryId = { in: params.categoryIds };
  }
  
  // Brand filter
  if (params.brands.length > 0) {
    where.brand = { in: params.brands };
  }
  
  // Tags filter
  if (params.tags.length > 0) {
    where.tags = { hasSome: params.tags };
  }
  
  // Price range filter
  if (params.minPrice !== null || params.maxPrice !== null) {
    where.price = {};
    if (params.minPrice !== null) {
      where.price.gte = params.minPrice;
    }
    if (params.maxPrice !== null) {
      where.price.lte = params.maxPrice;
    }
  }
  
  return where;
}

/**
 * Build Prisma orderBy clause from sort parameter
 */
export function buildSortClause(sort: string): Prisma.PartOrderByWithRelationInput | Prisma.PartOrderByWithRelationInput[] {
  switch (sort) {
    case 'price-asc':
      return { price: 'asc' };
    case 'price-desc':
      return { price: 'desc' };
    case 'name-asc':
      return { name: 'asc' };
    case 'name-desc':
      return { name: 'desc' };
    case 'newest':
      return { createdAt: 'desc' };
    case 'relevance':
    default:
      // For relevance, prioritize featured products and then newest
      return [
        { featured: 'desc' },
        { createdAt: 'desc' },
      ];
  }
}

/**
 * Highlight search terms in text
 * Wraps matches in <mark> tags for styling
 */
export function highlightSearchTerm(text: string, term: string): string {
  if (!text || !term) return text;
  
  const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedTerm})`, 'gi');
  
  return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Format price for display
 */
export function formatPrice(price: number | string): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numPrice);
}

/**
 * Calculate discount percentage
 */
export function calculateDiscount(price: number, comparePrice: number): number {
  if (!comparePrice || comparePrice <= price) return 0;
  
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}

/**
 * Build URL with search parameters
 */
export function buildSearchUrl(baseUrl: string, params: Partial<ParsedSearchParams>): string {
  const url = new URL(baseUrl, window.location.origin);
  
  if (params.query) url.searchParams.set('q', params.query);
  if (params.page && params.page > 1) url.searchParams.set('page', params.page.toString());
  if (params.sort && params.sort !== 'relevance') url.searchParams.set('sort', params.sort);
  
  params.categoryIds?.forEach(id => url.searchParams.append('categoryId', id));
  params.brands?.forEach(brand => url.searchParams.append('brand', brand));
  params.tags?.forEach(tag => url.searchParams.append('tags', tag));
  
  if (params.minPrice !== null && params.minPrice !== undefined) {
    url.searchParams.set('minPrice', params.minPrice.toString());
  }
  if (params.maxPrice !== null && params.maxPrice !== undefined) {
    url.searchParams.set('maxPrice', params.maxPrice.toString());
  }
  
  return url.toString();
}

/**
 * Validate search query
 */
export function isValidSearchQuery(query: string): boolean {
  if (!query || typeof query !== 'string') return false;
  
  const trimmed = query.trim();
  
  // Minimum length
  if (trimmed.length < 2) return false;
  
  // Maximum length
  if (trimmed.length > 200) return false;
  
  return true;
}

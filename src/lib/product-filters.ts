/**
 * Product Filtering Utility Module
 * 
 * Centralized filtering logic for products used across:
 * - Page preview API (groupType filtering)
 * - Collection products API (filterRules)
 * - Future search/discovery features
 */

import { Prisma } from "@prisma/client";

/**
 * Product filter parameters
 */
export interface ProductFilters {
  categoryIds?: string[];
  tags?: string[];
  brands?: string[];
  origins?: string[];
  difficulties?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
}

/**
 * Valid sort options for products
 */
export type ProductSortBy = "name" | "price" | "createdAt" | "featured";

/**
 * Builds a Prisma where clause for product filtering
 * 
 * @param filters - Filter parameters to apply
 * @returns Prisma where clause object for Part model
 * 
 * @example
 * ```typescript
 * const where = buildProductWhereClause({
 *   categoryIds: ['cat1', 'cat2'],
 *   minPrice: 10,
 *   maxPrice: 100,
 *   inStock: true
 * });
 * const products = await prisma.part.findMany({ where });
 * ```
 */
export function buildProductWhereClause(
  filters: ProductFilters
): Prisma.PartWhereInput {
  const where: Prisma.PartWhereInput = {};

  // Category filter - match any of the provided category IDs
  if (filters.categoryIds && filters.categoryIds.length > 0) {
    where.categoryId = {
      in: filters.categoryIds,
    };
  }

  // Brand filter - match any of the provided brands
  if (filters.brands && filters.brands.length > 0) {
    where.brand = {
      in: filters.brands,
    };
  }

  // Tags filter - match products that have at least one of the provided tags
  // Uses Prisma's hasSome for array fields
  if (filters.tags && filters.tags.length > 0) {
    where.tags = {
      hasSome: filters.tags,
    };
  }

  // Origin filter - match any of the provided origins
  if (filters.origins && filters.origins.length > 0) {
    where.origin = {
      in: filters.origins,
    };
  }

  // Difficulty filter - match any of the provided difficulty levels
  if (filters.difficulties && filters.difficulties.length > 0) {
    where.difficulty = {
      in: filters.difficulties,
    };
  }

  // Price range filter
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    
    if (filters.minPrice !== undefined) {
      where.price.gte = filters.minPrice;
    }
    
    if (filters.maxPrice !== undefined) {
      where.price.lte = filters.maxPrice;
    }
  }

  // Stock availability filter
  if (filters.inStock !== undefined) {
    where.inStock = filters.inStock;
  }

  // Featured status filter
  if (filters.featured !== undefined) {
    where.featured = filters.featured;
  }

  return where;
}

/**
 * Gets the Prisma orderBy object for product sorting
 * 
 * @param sortBy - Sort field name
 * @returns Prisma orderBy object for Part model
 * 
 * @example
 * ```typescript
 * const orderBy = getSortOrder('price');
 * const products = await prisma.part.findMany({
 *   orderBy,
 *   where: buildProductWhereClause(filters)
 * });
 * ```
 */
export function getSortOrder(sortBy: ProductSortBy): Prisma.PartOrderByWithRelationInput {
  switch (sortBy) {
    case "name":
      return { name: "asc" };
    
    case "price":
      return { price: "asc" };
    
    case "featured":
      // Featured items first, then by creation date
      return { featured: "desc" };
    
    case "createdAt":
    default:
      return { createdAt: "desc" };
  }
}

/**
 * Validates price range filters
 * 
 * @param minPrice - Minimum price
 * @param maxPrice - Maximum price
 * @returns True if price range is valid
 */
export function validatePriceRange(
  minPrice?: number,
  maxPrice?: number
): boolean {
  if (minPrice !== undefined && minPrice < 0) {
    return false;
  }
  
  if (maxPrice !== undefined && maxPrice < 0) {
    return false;
  }
  
  if (minPrice !== undefined && maxPrice !== undefined) {
    return minPrice < maxPrice;
  }
  
  return true;
}

/**
 * Sanitizes filter values to ensure they are valid
 * Removes empty arrays, null values, and invalid data
 * 
 * @param filters - Raw filter object
 * @returns Sanitized filter object
 */
export function sanitizeFilters(filters: Partial<ProductFilters>): ProductFilters {
  const sanitized: ProductFilters = {};

  // Remove empty arrays
  if (filters.categoryIds && filters.categoryIds.length > 0) {
    sanitized.categoryIds = filters.categoryIds.filter(id => id && id.trim().length > 0);
  }

  if (filters.tags && filters.tags.length > 0) {
    sanitized.tags = filters.tags.filter(tag => tag && tag.trim().length > 0);
  }

  if (filters.brands && filters.brands.length > 0) {
    sanitized.brands = filters.brands.filter(brand => brand && brand.trim().length > 0);
  }

  if (filters.origins && filters.origins.length > 0) {
    sanitized.origins = filters.origins.filter(origin => origin && origin.trim().length > 0);
  }

  if (filters.difficulties && filters.difficulties.length > 0) {
    sanitized.difficulties = filters.difficulties.filter(diff => diff && diff.trim().length > 0);
  }

  // Validate and include price filters
  if (filters.minPrice !== undefined && filters.minPrice >= 0) {
    sanitized.minPrice = filters.minPrice;
  }

  if (filters.maxPrice !== undefined && filters.maxPrice >= 0) {
    sanitized.maxPrice = filters.maxPrice;
  }

  // Include boolean filters if explicitly set
  if (filters.inStock !== undefined) {
    sanitized.inStock = filters.inStock;
  }

  if (filters.featured !== undefined) {
    sanitized.featured = filters.featured;
  }

  return sanitized;
}

/**
 * Counts the number of active filters
 * Useful for UI badges showing "5 filters applied"
 * 
 * @param filters - Filter object
 * @returns Number of active filters
 */
export function countActiveFilters(filters: ProductFilters): number {
  let count = 0;

  if (filters.categoryIds && filters.categoryIds.length > 0) count++;
  if (filters.tags && filters.tags.length > 0) count++;
  if (filters.brands && filters.brands.length > 0) count++;
  if (filters.origins && filters.origins.length > 0) count++;
  if (filters.difficulties && filters.difficulties.length > 0) count++;
  if (filters.minPrice !== undefined) count++;
  if (filters.maxPrice !== undefined) count++;
  if (filters.inStock !== undefined) count++;
  if (filters.featured !== undefined) count++;

  return count;
}

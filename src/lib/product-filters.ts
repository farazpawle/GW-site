/**
 * Product Filtering Utility Module (Shopify-style)
 * 
 * Centralized filtering logic for smart collections using condition-based rules
 * Converts Shopify-style conditions into Prisma where clauses
 */

import { Prisma } from "@prisma/client";
import type { Condition, CollectionFilterRules } from "@/lib/validations/collection";

/**
 * Valid sort options for collections
 */
export type CollectionSortBy = 
  | "manual" 
  | "best_selling" 
  | "created_desc" 
  | "created_asc" 
  | "price_asc" 
  | "price_desc" 
  | "alpha_asc" 
  | "alpha_desc";

/**
 * Builds a Prisma where clause from a single condition
 * 
 * @param condition - Single condition object
 * @returns Prisma where clause fragment
 */
function buildConditionWhereClause(condition: Condition): Prisma.PartWhereInput {
  const { field, operator, value } = condition;
  const where: Prisma.PartWhereInput = {};

  // Product Title conditions
  if (field === 'product_title') {
    if (operator === 'equals') {
      where.name = { equals: String(value), mode: 'insensitive' };
    } else if (operator === 'not_equals') {
      where.name = { not: String(value), mode: 'insensitive' };
    } else if (operator === 'contains') {
      where.name = { contains: String(value), mode: 'insensitive' };
    } else if (operator === 'not_contains') {
      where.NOT = { name: { contains: String(value), mode: 'insensitive' } };
    } else if (operator === 'starts_with') {
      where.name = { startsWith: String(value), mode: 'insensitive' };
    } else if (operator === 'ends_with') {
      where.name = { endsWith: String(value), mode: 'insensitive' };
    }
  }

  // Product Vendor/Brand conditions
  else if (field === 'product_vendor') {
    if (operator === 'equals') {
      where.brand = { equals: String(value), mode: 'insensitive' };
    } else if (operator === 'not_equals') {
      where.brand = { not: String(value), mode: 'insensitive' };
    }
  }

  // Product Tag conditions
  else if (field === 'product_tag') {
    if (operator === 'equals') {
      where.tags = { has: String(value) };
    } else if (operator === 'not_equals') {
      where.NOT = { tags: { has: String(value) } };
    }
  }

  // Variant Price conditions
  else if (field === 'variant_price') {
    const numValue = Number(value);
    if (operator === 'equals') {
      where.price = { equals: numValue };
    } else if (operator === 'not_equals') {
      where.price = { not: numValue };
    } else if (operator === 'greater_than') {
      where.price = { gt: numValue };
    } else if (operator === 'less_than') {
      where.price = { lt: numValue };
    }
  }

  // Compare at Price conditions
  else if (field === 'variant_compare_at_price') {
    if (operator === 'is_set') {
      where.compareAtPrice = { not: null };
    } else if (operator === 'is_not_set') {
      where.compareAtPrice = null;
    } else {
      const numValue = Number(value);
      if (operator === 'equals') {
        where.compareAtPrice = { equals: numValue };
      } else if (operator === 'not_equals') {
        where.compareAtPrice = { not: numValue };
      } else if (operator === 'greater_than') {
        where.compareAtPrice = { gt: numValue };
      } else if (operator === 'less_than') {
        where.compareAtPrice = { lt: numValue };
      }
    }
  }

  // Variant Weight conditions - NOT SUPPORTED (field doesn't exist in schema)
  // Keeping for future expansion if weight field is added

  // Variant Inventory conditions - NOT SUPPORTED (no stock field in schema)
  // Keeping for future expansion if inventory tracking is added

  return where;
}

/**
 * Builds a Prisma where clause from collection filter rules (Shopify-style)
 * 
 * @param rules - Collection filter rules with conditions and match type
 * @returns Prisma where clause object for Part model
 * 
 * @example
 * ```typescript
 * const rules = {
 *   match: 'all',
 *   conditions: [
 *     { field: 'product_tag', operator: 'equals', value: 'summer' },
 *     { field: 'variant_price', operator: 'less_than', value: 100 }
 *   ]
 * };
 * const where = buildProductWhereClause(rules);
 * const products = await prisma.part.findMany({ where });
 * ```
 */
export function buildProductWhereClause(
  rules: CollectionFilterRules
): Prisma.PartWhereInput {
  const conditionClauses = rules.conditions.map(buildConditionWhereClause);

  // Use AND or OR logic based on match type
  if (rules.match === 'all') {
    return { AND: conditionClauses };
  } else {
    return { OR: conditionClauses };
  }
}

/**
 * Gets the Prisma orderBy object for collection sorting (Shopify-style)
 * 
 * @param sortBy - Sort option
 * @returns Prisma orderBy object for Part model
 * 
 * @example
 * ```typescript
 * const orderBy = getCollectionSortOrder('price_asc');
 * const products = await prisma.part.findMany({ orderBy, where });
 * ```
 */
export function getCollectionSortOrder(sortBy: CollectionSortBy): Prisma.PartOrderByWithRelationInput {
  switch (sortBy) {
    case "manual":
      // For manual collections, sort by the order products were added
      return { createdAt: "desc" };
    
    case "best_selling":
      // Sort by views as a proxy for best selling
      return { views: "desc" };
    
    case "created_desc":
      return { createdAt: "desc" };
    
    case "created_asc":
      return { createdAt: "asc" };
    
    case "price_asc":
      return { price: "asc" };
    
    case "price_desc":
      return { price: "desc" };
    
    case "alpha_asc":
      return { name: "asc" };
    
    case "alpha_desc":
      return { name: "desc" };
    
    default:
      return { createdAt: "desc" };
  }
}

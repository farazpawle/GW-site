import { Part, Category } from '@prisma/client'

/**
 * Product with category relation included
 */
export type ProductWithCategory = Part & {
  category: Category
}

/**
 * Showcase-specific fields from Phase 4.5
 */
export type ShowcaseFields = {
  published: boolean
  publishedAt: Date | null
  views: number
  showcaseOrder: number
  tags: string[]
  brand: string | null
  origin: string | null
  certifications: string[]
  warranty: string | null
  difficulty: string | null
  application: string[]
  videoUrl: string | null
  pdfUrl: string | null
}

/**
 * Product form data type (for react-hook-form)
 * Includes all fields that can be edited in admin forms
 */
export type ProductFormData = {
  // Basic information
  name: string
  slug: string
  description?: string
  shortDesc?: string
  partNumber: string
  
  // Pricing & inventory
  price: number
  comparePrice?: number
  inStock: boolean
  stockQuantity: number
  
  // Media
  images: string[]
  
  // Product details
  specifications?: Record<string, unknown>
  compatibility: string[]
  categoryId: string
  featured: boolean
  
  // Showcase fields (Phase 4.5)
  published: boolean
  publishedAt?: Date
  showcaseOrder: number
  tags: string[]
  brand?: string
  origin?: string
  certifications: string[]
  warranty?: string
  difficulty?: string
  application: string[]
  videoUrl?: string
  pdfUrl?: string
}

/**
 * Serialized product type for client components
 * Decimal fields converted to numbers to avoid serialization issues
 */
export type SerializedProduct = Omit<Part, 'price' | 'comparePrice' | 'category'> & {
  price: number
  comparePrice: number | null
  category: Category
}

/**
 * Serialized product with optional pricing (mode-aware)
 * Used in public APIs based on e-commerce mode
 */
export type SerializedProductWithOptionalPricing = Omit<Part, 'price' | 'comparePrice' | 'category'> & {
  price?: number
  comparePrice?: number | null
  category: Category
}

/**
 * Product list item (minimal fields for list view)
 */
export type ProductListItem = {
  id: string
  name: string
  slug: string
  partNumber: string
  price: number
  comparePrice: number | null
  inStock: boolean
  images: string[]
  featured: boolean
  tags: string[]
  brand: string | null
  origin: string | null
  published: boolean
  showcaseOrder: number
  category: {
    id: string
    name: string
    slug: string
  }
}

/**
 * Product filters for public showcase
 */
export type ProductFilters = {
  search?: string
  category?: string
  tags?: string[]
  brand?: string
  origin?: string
  difficulty?: string
  application?: string[]
  featured?: boolean
  published?: boolean
  sort?: 'showcase' | 'newest' | 'popular' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc'
  page?: number
  limit?: number
}

/**
 * Product API response (mode-aware)
 */
export type ProductApiResponse = {
  success: boolean
  mode: 'showcase' | 'ecommerce'
  data: SerializedProductWithOptionalPricing[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  filters?: {
    tags: string[]
    brands: string[]
    origins: string[]
    difficulties: string[]
    applications: string[]
  }
}

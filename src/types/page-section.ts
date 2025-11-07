/**
 * TypeScript types and Zod validation schemas for PageSection model
 */

import { z } from 'zod';
import { textStyleSchema } from './typography';

// ============================================================================
// Section Types
// ============================================================================

export type SectionType = 'hero' | 'brandStory' | 'carousel' | 'categories' | 'precisionMfg';

// ============================================================================
// Hero Section Config
// ============================================================================

export const heroSectionConfigSchema = z.object({
  backgroundType: z.enum(['paths', 'shader']).optional().default('paths'),
  badge: z.object({
    text: z.string().min(1, 'Badge text is required'),
    icon: z.string().optional(),
    textStyle: textStyleSchema
  }),
  title: z.object({
    line1: z.string().min(1, 'First title line is required'),
    line2: z.string().min(1, 'Second title line is required'),
    line1Style: textStyleSchema,
    line2Style: textStyleSchema
  }),
  description: z.string().min(1, 'Description is required'),
  descriptionStyle: textStyleSchema,
  primaryCTA: z.object({
    show: z.boolean(),
    text: z.string().min(1, 'Primary CTA text is required'),
    link: z.string().min(1, 'Primary CTA link is required')
  }),
  secondaryCTA: z.object({
    show: z.boolean(),
    text: z.string().min(1, 'Secondary CTA text is required'),
    link: z.string().min(1, 'Secondary CTA link is required')
  }),
  statistics: z.object({
    show: z.boolean(),
    stats: z.array(
      z.object({
        value: z.number().min(0, 'Value must be positive'),
        suffix: z.string().min(1, 'Suffix is required'),
        label: z.string().min(1, 'Label is required'),
        valueStyle: textStyleSchema,
        labelStyle: textStyleSchema
      })
    ).length(3, 'Exactly 3 statistics are required')
  })
});

export type HeroSectionConfig = z.infer<typeof heroSectionConfigSchema>;

// ============================================================================
// Brand Story Section Config
// ============================================================================

export const brandStorySectionConfigSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  titleStyle: textStyleSchema,
  subtitle: z.string().min(1, 'Subtitle is required'),
  subtitleStyle: textStyleSchema,
  content: z.array(z.string().min(1, 'Content paragraph cannot be empty')).min(1, 'At least one content paragraph is required'),
  contentStyle: textStyleSchema,
  cta: z.object({
    show: z.boolean(),
    text: z.string().min(1, 'CTA text is required'),
    link: z.string().min(1, 'CTA link is required')
  }),
  features: z.object({
    show: z.boolean(),
    items: z.array(
      z.object({
        icon: z.string().min(1, 'Feature icon is required'),
        title: z.string().min(1, 'Feature title is required'),
        description: z.string().min(1, 'Feature description is required'),
        titleStyle: textStyleSchema,
        descriptionStyle: textStyleSchema
      })
    ).length(3, 'Exactly 3 features are required')
  })
});

export type BrandStorySectionConfig = z.infer<typeof brandStorySectionConfigSchema>;

// ============================================================================
// Carousel Section Config
// ============================================================================

export const carouselSectionConfigSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  headingStyle: textStyleSchema,
  description: z.string().optional(),
  descriptionStyle: textStyleSchema,
  speed: z.number().min(0.5).max(3.0).optional().default(0.5),
  itemsPerView: z.object({
    mobile: z.number().min(1).max(4).default(2),
    tablet: z.number().min(2).max(6).default(3),
    desktop: z.number().min(3).max(8).default(5)
  }).optional().default({ mobile: 2, tablet: 3, desktop: 5 }),
  logos: z.array(
    z.object({
      id: z.string().min(1, 'Logo ID is required'),
      description: z.string().min(1, 'Logo description is required'),
      altText: z.string().optional().default(''),
      image: z.string().min(1, 'Logo image URL is required'),
      isActive: z.boolean().optional().default(true),
      order: z.number().optional().default(0)
    })
  ).min(1, 'At least one logo is required')
});

export type CarouselSectionConfig = z.infer<typeof carouselSectionConfigSchema>;

// ============================================================================
// Categories Section Config
// ============================================================================

export const categoriesSectionConfigSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  titleStyle: textStyleSchema,
  description: z.string().optional(),
  descriptionStyle: textStyleSchema,
  show: z.boolean().optional().default(true),
  accentColor: z.string().optional().default('#6e0000'),
  backgroundPattern: z.boolean().optional().default(true),
  gridColumns: z.number().min(2).max(4).optional().default(3),
  cardStyle: z.enum(['boxed', 'minimal', 'image-heavy']).optional().default('boxed'),
  iconPosition: z.enum(['top', 'left', 'right', 'bottom']).optional().default('top'),
  categories: z.array(
    z.object({
      icon: z.string().min(1, 'Category icon is required'),
      title: z.string().min(1, 'Category title is required'),
      titleStyle: textStyleSchema,
      description: z.string().min(1, 'Category description is required'),
      descriptionStyle: textStyleSchema,
      isActive: z.boolean().optional().default(true),
      order: z.number().optional().default(0),
      backgroundImage: z.string().optional(),
      cta: z.object({
        show: z.boolean().optional().default(false),
        text: z.string().optional().default('View Products'),
        link: z.string().optional().default('#')
      }).optional()
    })
  ).min(1, 'At least one category is required')
});

export type CategoriesSectionConfig = z.infer<typeof categoriesSectionConfigSchema>;

// ============================================================================
// Precision Manufacturing Section Config
// ============================================================================

export const precisionMfgSectionConfigSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  titleStyle: textStyleSchema,
  description: z.string().optional(),
  descriptionStyle: textStyleSchema,
  show: z.boolean().optional(),
  accentColor: z.string().optional(),
  gridColumns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
  cardStyle: z.enum(['standard', 'minimal', 'image-heavy', 'side-by-side']).optional(),
  ctaStyle: z.enum(['solid', 'outline', 'ghost']).optional(),
  badge: z.object({
    show: z.boolean(),
    position: z.enum(['top-left', 'top-right', 'bottom-left', 'bottom-right'])
  }).optional(),
  services: z.array(
    z.object({
      title: z.string().min(1, 'Service title is required'),
      titleStyle: textStyleSchema,
      description: z.string().min(1, 'Service description is required'),
      descriptionStyle: textStyleSchema,
      image: z.string().min(1, 'Service image URL is required'),
      altText: z.string().optional(),
      badgeText: z.string().optional(),
      isActive: z.boolean().optional(),
      order: z.number().optional(),
      cta: z.object({
        show: z.boolean(),
        text: z.string(),
        link: z.string()
      }).optional()
    })
  ).min(1, 'At least one service is required')
});

export type PrecisionMfgSectionConfig = z.infer<typeof precisionMfgSectionConfigSchema>;

// ============================================================================
// Generic Section Config (Union Type)
// ============================================================================

export type SectionConfig = 
  | HeroSectionConfig 
  | BrandStorySectionConfig 
  | CarouselSectionConfig 
  | CategoriesSectionConfig 
  | PrecisionMfgSectionConfig;

// ============================================================================
// PageSection Model
// ============================================================================

export interface PageSection {
  id: string;
  pageId: string;
  sectionType: SectionType;
  name?: string; // Optional custom name for the section
  position: number;
  visible: boolean;
  config: SectionConfig;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// API Request/Response Schemas
// ============================================================================

// Base section schema (without config validation)
export const pageSectionBaseSchema = z.object({
  pageId: z.string().cuid('Invalid page ID'),
  sectionType: z.enum(['hero', 'brandStory', 'carousel', 'categories', 'precisionMfg']),
  position: z.number().int().min(0, 'Position must be non-negative'),
  visible: z.boolean().default(true)
});

// Create section request schema (dynamic config validation based on sectionType)
export const createPageSectionSchema = pageSectionBaseSchema.and(
  z.object({
    config: z.any() // Will be validated dynamically based on sectionType
  })
);

// Update section request schema
export const updatePageSectionSchema = z.object({
  sectionType: z.enum(['hero', 'brandStory', 'carousel', 'categories', 'precisionMfg']).optional(),
  name: z.union([z.string().trim().min(1).max(100), z.null()]).optional(), // Optional custom section name
  position: z.number().int().min(0).optional(),
  visible: z.boolean().optional(),
  config: z.any().optional() // Will be validated dynamically based on sectionType
});

// Reorder sections request schema
export const reorderSectionsSchema = z.object({
  pageId: z.string().cuid('Invalid page ID'),
  sections: z.array(
    z.object({
      id: z.string().cuid('Invalid section ID'),
      position: z.number().int().min(0, 'Position must be non-negative')
    })
  ).min(1, 'At least one section is required')
});

// ============================================================================
// Type Guards
// ============================================================================

export function isHeroConfig(config: SectionConfig): config is HeroSectionConfig {
  return 'badge' in config && 'title' in config && 'description' in config;
}

export function isBrandStoryConfig(config: SectionConfig): config is BrandStorySectionConfig {
  return 'features' in config && Array.isArray((config as BrandStorySectionConfig).features);
}

export function isCarouselConfig(config: SectionConfig): config is CarouselSectionConfig {
  return 'logos' in config && Array.isArray((config as CarouselSectionConfig).logos);
}

export function isCategoriesConfig(config: SectionConfig): config is CategoriesSectionConfig {
  return 'categories' in config && Array.isArray((config as CategoriesSectionConfig).categories);
}

export function isPrecisionMfgConfig(config: SectionConfig): config is PrecisionMfgSectionConfig {
  return 'services' in config && Array.isArray((config as PrecisionMfgSectionConfig).services);
}

// ============================================================================
// Validation Helper
// ============================================================================

/**
 * Validates section config based on section type
 */
export function validateSectionConfig(sectionType: SectionType, config: unknown) {
  switch (sectionType) {
    case 'hero':
      return heroSectionConfigSchema.parse(config);
    case 'brandStory':
      return brandStorySectionConfigSchema.parse(config);
    case 'carousel':
      return carouselSectionConfigSchema.parse(config);
    case 'categories':
      return categoriesSectionConfigSchema.parse(config);
    case 'precisionMfg':
      return precisionMfgSectionConfigSchema.parse(config);
    default:
      throw new Error(`Unknown section type: ${sectionType}`);
  }
}

// ============================================================================
// API Types
// ============================================================================

export type CreatePageSectionRequest = z.infer<typeof createPageSectionSchema>;
export type UpdatePageSectionRequest = z.infer<typeof updatePageSectionSchema>;
export type ReorderSectionsRequest = z.infer<typeof reorderSectionsSchema>;

export interface PageSectionResponse {
  success: boolean;
  data?: PageSection;
  error?: string;
}

export interface PageSectionsListResponse {
  success: boolean;
  data?: PageSection[];
  error?: string;
}

export interface ReorderSectionsResponse {
  success: boolean;
  message?: string;
  error?: string;
}

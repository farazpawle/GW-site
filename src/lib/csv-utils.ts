/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma } from '@prisma/client';
import { prisma } from './prisma';

/**
 * CSV column headers (29 columns)
 */
export const CSV_HEADERS = [
  'name',
  'sku',
  'partNumber',
  'price',
  'comparePrice',
  'compareAtPrice',
  'description',
  'shortDesc',
  'category',
  'brand',
  'origin',
  'warranty',
  'tags',
  'compatibility',
  'application',
  'certifications',
  'images',
  'specifications',
  'pdfUrl',
  'featured',
  'published',
  'publishedAt',
  'showcaseOrder',
  'views',
  'hasVariants',
  'stockQuantity',
  'inStock',
] as const;

/**
 * CSV row type
 */
export interface CSVRow {
  name: string;
  sku: string;
  partNumber: string;
  price: string;
  comparePrice: string;
  compareAtPrice: string;
  description: string;
  shortDesc: string;
  category: string;
  brand: string;
  origin: string;
  warranty: string;
  tags: string;
  compatibility: string;
  application: string;
  certifications: string;
  images: string;
  specifications: string;
  pdfUrl: string;
  featured: string;
  published: string;
  publishedAt: string;
  showcaseOrder: string;
  views: string;
  hasVariants: string;
  stockQuantity?: string;
  inStock?: string;
}

/**
 * Validation error type
 */
export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

/**
 * Validation warning type
 */
export interface ValidationWarning {
  row: number;
  field: string;
  message: string;
}

/**
 * Transform a Part (with category) to CSV row
 * Handles Decimal → String, Array → Pipe-delimited, JSON → String
 */
export function exportProductToCSV(
  part: Prisma.PartGetPayload<{ include: { category: true } }>,
  categoryName: string
): Record<string, string> {
  return {
    name: part.name || '',
    sku: part.sku || '',
    partNumber: part.partNumber || '',
    price: part.price ? part.price.toString() : '',
    comparePrice: part.comparePrice ? part.comparePrice.toString() : '',
    compareAtPrice: part.compareAtPrice ? part.compareAtPrice.toString() : '',
    description: part.description || '',
    shortDesc: part.shortDesc || '',
    category: categoryName,
    brand: part.brand || '',
    origin: part.origin || '',
    warranty: part.warranty || '',
    tags: Array.isArray(part.tags) ? part.tags.join('|') : '',
    compatibility: Array.isArray(part.compatibility) ? part.compatibility.join('|') : '',
    application: Array.isArray(part.application) ? part.application.join('|') : '',
    certifications: Array.isArray(part.certifications) ? part.certifications.join('|') : '',
    images: Array.isArray(part.images) ? part.images.join('|') : '',
    specifications: part.specifications ? JSON.stringify(part.specifications) : '',
    pdfUrl: part.pdfUrl || '',
    featured: part.featured ? 'true' : 'false',
    published: part.published ? 'true' : 'false',
    publishedAt: part.publishedAt ? part.publishedAt.toISOString() : '',
    showcaseOrder: part.showcaseOrder?.toString() || '999',
    views: part.views?.toString() || '0',
    hasVariants: part.hasVariants ? 'true' : 'false',
    stockQuantity: (part as any).stockQuantity?.toString() || '0',
    inStock: (part as any).inStock ? 'true' : 'false',
  };
}

/**
 * Parse CSV row string to typed object
 * Basic string parsing - validation happens separately
 */
export function parseCSVRow(row: Record<string, unknown>): CSVRow {
  return {
    name: String(row.name || ''),
    sku: String(row.sku || ''),
    partNumber: String(row.partNumber || ''),
    price: String(row.price || ''),
    comparePrice: String(row.comparePrice || ''),
    compareAtPrice: String(row.compareAtPrice || ''),
    description: String(row.description || ''),
    shortDesc: String(row.shortDesc || ''),
    category: String(row.category || ''),
    brand: String(row.brand || ''),
    origin: String(row.origin || ''),
    warranty: String(row.warranty || ''),
    tags: String(row.tags || ''),
    compatibility: String(row.compatibility || ''),
    application: String(row.application || ''),
    certifications: String(row.certifications || ''),
    images: String(row.images || ''),
    specifications: String(row.specifications || ''),
    pdfUrl: String(row.pdfUrl || ''),
    featured: String(row.featured || ''),
    published: String(row.published || ''),
    publishedAt: String(row.publishedAt || ''),
    showcaseOrder: String(row.showcaseOrder || ''),
    views: String(row.views || ''),
    hasVariants: String(row.hasVariants || ''),
    stockQuantity: String(row.stockQuantity || '0'),
    inStock: String(row.inStock || 'true'),
  };
}

/**
 * Validate a single CSV row
 * Returns errors and warnings arrays
 */
export function validateCSVRow(
  row: CSVRow,
  rowIndex: number,
  existingSKUs: Set<string>,
  categories: Map<string, string>
): { errors: ValidationError[]; warnings: ValidationWarning[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Required fields
  if (!row.name || row.name.trim().length < 3) {
    errors.push({
      row: rowIndex,
      field: 'name',
      message: 'Name is required (minimum 3 characters)',
    });
  }

  if (!row.sku || row.sku.trim().length === 0) {
    errors.push({
      row: rowIndex,
      field: 'sku',
      message: 'SKU is required',
    });
  } else if (!/^[A-Z0-9-]+$/.test(row.sku)) {
    errors.push({
      row: rowIndex,
      field: 'sku',
      message: 'SKU must contain only uppercase letters, numbers, and hyphens',
    });
  } else if (existingSKUs.has(row.sku)) {
    errors.push({
      row: rowIndex,
      field: 'sku',
      message: `SKU "${row.sku}" already exists`,
    });
  }

  if (!row.partNumber || row.partNumber.trim().length === 0) {
    errors.push({
      row: rowIndex,
      field: 'partNumber',
      message: 'Part number is required',
    });
  } else if (!/^[A-Z0-9-]+$/.test(row.partNumber)) {
    errors.push({
      row: rowIndex,
      field: 'partNumber',
      message: 'Part number must contain only uppercase letters, numbers, and hyphens',
    });
  }

  if (!row.price || row.price.trim().length === 0) {
    errors.push({
      row: rowIndex,
      field: 'price',
      message: 'Price is required',
    });
  } else {
    const priceNum = parseFloat(row.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      errors.push({
        row: rowIndex,
        field: 'price',
        message: 'Price must be a positive number',
      });
    } else if (priceNum > 999999.99) {
      errors.push({
        row: rowIndex,
        field: 'price',
        message: 'Price must not exceed 999,999.99',
      });
    }
  }

  if (!row.category || row.category.trim().length === 0) {
    errors.push({
      row: rowIndex,
      field: 'category',
      message: 'Category is required',
    });
  } else {
    const categoryLower = row.category.toLowerCase().trim();
    if (!categories.has(categoryLower)) {
      errors.push({
        row: rowIndex,
        field: 'category',
        message: `Category "${row.category}" not found`,
      });
    }
  }

  // Optional field validation with warnings
  if (row.comparePrice && row.comparePrice.trim().length > 0) {
    const comparePriceNum = parseFloat(row.comparePrice);
    if (isNaN(comparePriceNum) || comparePriceNum <= 0) {
      warnings.push({
        row: rowIndex,
        field: 'comparePrice',
        message: 'Invalid compare price - will be set to null',
      });
    }
  }

  if (row.specifications && row.specifications.trim().length > 0) {
    try {
      JSON.parse(row.specifications);
    } catch {
      warnings.push({
        row: rowIndex,
        field: 'specifications',
        message: 'Invalid JSON in specifications - will be set to null',
      });
    }
  }

  if (row.showcaseOrder && row.showcaseOrder.trim().length > 0) {
    const orderNum = parseInt(row.showcaseOrder);
    if (isNaN(orderNum) || orderNum < 1) {
      warnings.push({
        row: rowIndex,
        field: 'showcaseOrder',
        message: 'Invalid showcase order - will be set to 999',
      });
    }
  }

  // Inventory field validation
  if (row.stockQuantity && row.stockQuantity.trim().length > 0) {
    const stockNum = parseInt(row.stockQuantity);
    if (isNaN(stockNum) || stockNum < 0) {
      errors.push({
        row: rowIndex,
        field: 'stockQuantity',
        message: 'Stock quantity must be a non-negative number',
      });
    }
  }

  if (row.inStock && row.inStock.trim().length > 0) {
    const inStockLower = row.inStock.toLowerCase().trim();
    if (inStockLower !== 'true' && inStockLower !== 'false' && inStockLower !== 'yes' && inStockLower !== 'no') {
      warnings.push({
        row: rowIndex,
        field: 'inStock',
        message: 'Invalid inStock value (must be true/false or yes/no) - will default to true',
      });
    }
  }

  return { errors, warnings };
}

/**
 * Transform CSV row to Prisma create/update data
 * Handles String → Decimal, Pipe → Array, String → JSON
 */
export function transformCSVToProduct(
  row: CSVRow,
  categoryId: string
): Prisma.PartCreateInput {
  // Parse price (required)
  const price = new Prisma.Decimal(parseFloat(row.price));

  // Parse optional prices
  const comparePrice = row.comparePrice && row.comparePrice.trim().length > 0
    ? new Prisma.Decimal(parseFloat(row.comparePrice))
    : null;

  const compareAtPrice = row.compareAtPrice && row.compareAtPrice.trim().length > 0
    ? new Prisma.Decimal(parseFloat(row.compareAtPrice))
    : null;

  // Parse arrays (pipe-delimited)
  const tags = row.tags && row.tags.trim().length > 0
    ? row.tags.split('|').map(t => t.trim()).filter(t => t.length > 0)
    : [];

  const compatibility = row.compatibility && row.compatibility.trim().length > 0
    ? row.compatibility.split('|').map(c => c.trim()).filter(c => c.length > 0)
    : [];

  const application = row.application && row.application.trim().length > 0
    ? row.application.split('|').map(a => a.trim()).filter(a => a.length > 0)
    : [];

  const certifications = row.certifications && row.certifications.trim().length > 0
    ? row.certifications.split('|').map(c => c.trim()).filter(c => c.length > 0)
    : [];

  const images = row.images && row.images.trim().length > 0
    ? row.images.split('|').map(i => i.trim()).filter(i => i.length > 0)
    : [];

  // Parse JSON specifications
  let specifications: Prisma.InputJsonValue | null = null;
  if (row.specifications && row.specifications.trim().length > 0) {
    try {
      specifications = JSON.parse(row.specifications);
    } catch {
      specifications = null;
    }
  }

  // Parse booleans
  const featured = row.featured === 'true';
  const published = row.published === 'true';
  const hasVariants = row.hasVariants === 'true';

  // Parse date
  let publishedAt: Date | null = null;
  if (row.publishedAt && row.publishedAt.trim().length > 0) {
    try {
      publishedAt = new Date(row.publishedAt);
      if (isNaN(publishedAt.getTime())) {
        publishedAt = null;
      }
    } catch {
      publishedAt = null;
    }
  }

  // Parse numbers
  const showcaseOrder = row.showcaseOrder && row.showcaseOrder.trim().length > 0
    ? parseInt(row.showcaseOrder)
    : 999;

  const views = row.views && row.views.trim().length > 0
    ? parseInt(row.views)
    : 0;

  // Parse inventory fields
  const stockQuantity = row.stockQuantity && row.stockQuantity.trim().length > 0
    ? parseInt(row.stockQuantity)
    : 0;

  const inStockLower = (row.inStock || '').toLowerCase().trim();
  const inStock = inStockLower === 'true' || inStockLower === 'yes' || inStockLower === '1';

  // Build Prisma create input
  return {
    name: row.name.trim(),
    sku: row.sku.trim(),
    partNumber: row.partNumber.trim(),
    slug: '', // Will be generated separately
    price,
    comparePrice,
    compareAtPrice,
    description: row.description.trim() || null,
    shortDesc: row.shortDesc.trim() || null,
    brand: row.brand.trim() || null,
    origin: row.origin.trim() || null,
    warranty: row.warranty.trim() || null,
    tags,
    compatibility,
    application,
    certifications,
    images,
    specifications: specifications || undefined,
    pdfUrl: row.pdfUrl.trim() || null,
    featured,
    published,
    publishedAt,
    showcaseOrder,
    views,
    hasVariants,
    stockQuantity,
    inStock,
    category: {
      connect: { id: categoryId },
    },
  } as Prisma.PartCreateInput;
}

/**
 * Resolve category name to ID (case-insensitive)
 */
export async function resolveCategoryByName(name: string): Promise<string | null> {
  const category = await prisma.category.findFirst({
    where: {
      name: {
        equals: name.trim(),
        mode: 'insensitive',
      },
    },
    select: { id: true },
  });

  return category?.id || null;
}

/**
 * Generate unique slug from name with collision handling
 */
export async function generateUniqueSlug(name: string): Promise<string> {
  // Generate base slug
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // Check if slug exists
  const existing = await prisma.part.findUnique({
    where: { slug: baseSlug },
  });

  // If doesn't exist, use base slug
  if (!existing) {
    return baseSlug;
  }

  // Generate slug with random suffix
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${baseSlug}-${randomSuffix}`;
}

/**
 * Format validation error for display
 */
export function formatValidationError(
  rowIndex: number,
  field: string,
  message: string
): string {
  return `Row ${rowIndex}: ${field} - ${message}`;
}

// ============================================================================
// CROSS REFERENCE CSV UTILITIES
// ============================================================================

/**
 * CSV column headers for Cross Reference
 */
export const CROSS_REFERENCE_CSV_HEADERS = [
  'productSKU',
  'referenceType',
  'brandName',
  'partNumber',
  'notes',
] as const;

export interface CrossReferenceCSVRow {
  productSKU: string;
  referenceType: string;
  brandName: string;
  partNumber: string;
  notes: string;
}

/**
 * Export Cross Reference to CSV row
 */
export function exportCrossReferenceToCSV(
  crossRef: Prisma.PartCrossReferenceGetPayload<{ include: { part: { select: { sku: true } } } }>
): Record<string, string> {
  return {
    productSKU: crossRef.part.sku,
    referenceType: crossRef.referenceType,
    brandName: crossRef.brandName,
    partNumber: crossRef.partNumber,
    notes: crossRef.notes || '',
  };
}

/**
 * Parse Cross Reference CSV row
 */
export function parseCrossReferenceCSVRow(row: Record<string, unknown>): CrossReferenceCSVRow {
  return {
    productSKU: String(row.productSKU || ''),
    referenceType: String(row.referenceType || ''),
    brandName: String(row.brandName || ''),
    partNumber: String(row.partNumber || ''),
    notes: String(row.notes || ''),
  };
}

/**
 * Validate Cross Reference CSV row
 */
export function validateCrossReferenceCSVRow(
  row: CrossReferenceCSVRow,
  rowIndex: number,
  existingSKUs: Set<string>
): { errors: ValidationError[]; warnings: ValidationWarning[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Required fields
  if (!row.productSKU || row.productSKU.trim().length === 0) {
    errors.push({
      row: rowIndex,
      field: 'productSKU',
      message: 'Product SKU is required',
    });
  } else if (!existingSKUs.has(row.productSKU.trim())) {
    errors.push({
      row: rowIndex,
      field: 'productSKU',
      message: `Product with SKU "${row.productSKU}" not found`,
    });
  }

  if (!row.referenceType || row.referenceType.trim().length === 0) {
    errors.push({
      row: rowIndex,
      field: 'referenceType',
      message: 'Reference type is required',
    });
  }

  if (!row.brandName || row.brandName.trim().length === 0) {
    errors.push({
      row: rowIndex,
      field: 'brandName',
      message: 'Brand name is required',
    });
  }

  if (!row.partNumber || row.partNumber.trim().length === 0) {
    errors.push({
      row: rowIndex,
      field: 'partNumber',
      message: 'Part number is required',
    });
  }

  return { errors, warnings };
}

/**
 * Transform Cross Reference CSV row to Prisma create input
 */
export function transformCSVToCrossReference(
  row: CrossReferenceCSVRow,
  partId: string
): Prisma.PartCrossReferenceCreateInput {
  return {
    part: {
      connect: { id: partId },
    },
    referenceType: row.referenceType.trim(),
    brandName: row.brandName.trim(),
    partNumber: row.partNumber.trim(),
    notes: row.notes.trim() || null,
  };
}

// ============================================================================
// OEM NUMBER CSV UTILITIES
// ============================================================================

/**
 * CSV column headers for OEM Numbers
 */
export const OEM_NUMBER_CSV_HEADERS = [
  'productSKU',
  'manufacturer',
  'oemPartNumber',
  'notes',
] as const;

export interface OEMNumberCSVRow {
  productSKU: string;
  manufacturer: string;
  oemPartNumber: string;
  notes: string;
}

/**
 * Export OEM Number to CSV row
 */
export function exportOEMNumberToCSV(
  oemNumber: Prisma.OEMPartNumberGetPayload<{ include: { part: { select: { sku: true } } } }>
): Record<string, string> {
  return {
    productSKU: oemNumber.part.sku,
    manufacturer: oemNumber.manufacturer,
    oemPartNumber: oemNumber.oemPartNumber,
    notes: oemNumber.notes || '',
  };
}

/**
 * Parse OEM Number CSV row
 */
export function parseOEMNumberCSVRow(row: Record<string, unknown>): OEMNumberCSVRow {
  return {
    productSKU: String(row.productSKU || ''),
    manufacturer: String(row.manufacturer || ''),
    oemPartNumber: String(row.oemPartNumber || ''),
    notes: String(row.notes || ''),
  };
}

/**
 * Validate OEM Number CSV row
 */
export function validateOEMNumberCSVRow(
  row: OEMNumberCSVRow,
  rowIndex: number,
  existingSKUs: Set<string>
): { errors: ValidationError[]; warnings: ValidationWarning[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Required fields
  if (!row.productSKU || row.productSKU.trim().length === 0) {
    errors.push({
      row: rowIndex,
      field: 'productSKU',
      message: 'Product SKU is required',
    });
  } else if (!existingSKUs.has(row.productSKU.trim())) {
    errors.push({
      row: rowIndex,
      field: 'productSKU',
      message: `Product with SKU "${row.productSKU}" not found`,
    });
  }

  if (!row.manufacturer || row.manufacturer.trim().length === 0) {
    errors.push({
      row: rowIndex,
      field: 'manufacturer',
      message: 'Manufacturer is required',
    });
  }

  if (!row.oemPartNumber || row.oemPartNumber.trim().length === 0) {
    errors.push({
      row: rowIndex,
      field: 'oemPartNumber',
      message: 'OEM part number is required',
    });
  }

  return { errors, warnings };
}

/**
 * Transform OEM Number CSV row to Prisma create input
 */
export function transformCSVToOEMNumber(
  row: OEMNumberCSVRow,
  partId: string
): Prisma.OEMPartNumberCreateInput {
  return {
    part: {
      connect: { id: partId },
    },
    manufacturer: row.manufacturer.trim(),
    oemPartNumber: row.oemPartNumber.trim(),
    notes: row.notes.trim() || null,
  };
}

// ============================================================================
// VEHICLE COMPATIBILITY CSV UTILITIES
// ============================================================================

/**
 * CSV column headers for Vehicle Compatibility
 */
export const VEHICLE_COMPATIBILITY_CSV_HEADERS = [
  'productSKU',
  'make',
  'model',
  'yearStart',
  'yearEnd',
  'engine',
  'trim',
  'position',
  'notes',
] as const;

export interface VehicleCompatibilityCSVRow {
  productSKU: string;
  make: string;
  model: string;
  yearStart: string;
  yearEnd: string;
  engine: string;
  trim: string;
  position: string;
  notes: string;
}

/**
 * Export Vehicle Compatibility to CSV row
 */
export function exportVehicleCompatibilityToCSV(
  vehicle: Prisma.VehicleCompatibilityGetPayload<{ include: { part: { select: { sku: true } } } }>
): Record<string, string> {
  return {
    productSKU: vehicle.part.sku,
    make: vehicle.make,
    model: vehicle.model,
    yearStart: vehicle.yearStart.toString(),
    yearEnd: vehicle.yearEnd.toString(),
    engine: vehicle.engine || '',
    trim: vehicle.trim || '',
    position: vehicle.position || '',
    notes: vehicle.notes || '',
  };
}

/**
 * Parse Vehicle Compatibility CSV row
 */
export function parseVehicleCompatibilityCSVRow(row: Record<string, unknown>): VehicleCompatibilityCSVRow {
  return {
    productSKU: String(row.productSKU || ''),
    make: String(row.make || ''),
    model: String(row.model || ''),
    yearStart: String(row.yearStart || ''),
    yearEnd: String(row.yearEnd || ''),
    engine: String(row.engine || ''),
    trim: String(row.trim || ''),
    position: String(row.position || ''),
    notes: String(row.notes || ''),
  };
}

/**
 * Validate Vehicle Compatibility CSV row
 */
export function validateVehicleCompatibilityCSVRow(
  row: VehicleCompatibilityCSVRow,
  rowIndex: number,
  existingSKUs: Set<string>
): { errors: ValidationError[]; warnings: ValidationWarning[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Required fields
  if (!row.productSKU || row.productSKU.trim().length === 0) {
    errors.push({
      row: rowIndex,
      field: 'productSKU',
      message: 'Product SKU is required',
    });
  } else if (!existingSKUs.has(row.productSKU.trim())) {
    errors.push({
      row: rowIndex,
      field: 'productSKU',
      message: `Product with SKU "${row.productSKU}" not found`,
    });
  }

  if (!row.make || row.make.trim().length === 0) {
    errors.push({
      row: rowIndex,
      field: 'make',
      message: 'Make is required',
    });
  }

  if (!row.model || row.model.trim().length === 0) {
    errors.push({
      row: rowIndex,
      field: 'model',
      message: 'Model is required',
    });
  }

  if (!row.yearStart || row.yearStart.trim().length === 0) {
    errors.push({
      row: rowIndex,
      field: 'yearStart',
      message: 'Start year is required',
    });
  } else {
    const yearStartNum = parseInt(row.yearStart);
    if (isNaN(yearStartNum) || yearStartNum < 1900 || yearStartNum > 2100) {
      errors.push({
        row: rowIndex,
        field: 'yearStart',
        message: 'Start year must be between 1900 and 2100',
      });
    }
  }

  if (!row.yearEnd || row.yearEnd.trim().length === 0) {
    errors.push({
      row: rowIndex,
      field: 'yearEnd',
      message: 'End year is required',
    });
  } else {
    const yearEndNum = parseInt(row.yearEnd);
    if (isNaN(yearEndNum) || yearEndNum < 1900 || yearEndNum > 2100) {
      errors.push({
        row: rowIndex,
        field: 'yearEnd',
        message: 'End year must be between 1900 and 2100',
      });
    } else if (row.yearStart && row.yearStart.trim().length > 0) {
      const yearStartNum = parseInt(row.yearStart);
      if (!isNaN(yearStartNum) && yearEndNum < yearStartNum) {
        errors.push({
          row: rowIndex,
          field: 'yearEnd',
          message: 'End year must be greater than or equal to start year',
        });
      }
    }
  }

  return { errors, warnings };
}

/**
 * Transform Vehicle Compatibility CSV row to Prisma create input
 */
export function transformCSVToVehicleCompatibility(
  row: VehicleCompatibilityCSVRow,
  partId: string
): Prisma.VehicleCompatibilityCreateInput {
  return {
    part: {
      connect: { id: partId },
    },
    make: row.make.trim(),
    model: row.model.trim(),
    yearStart: parseInt(row.yearStart),
    yearEnd: parseInt(row.yearEnd),
    engine: row.engine.trim() || null,
    trim: row.trim.trim() || null,
    position: row.position.trim() || null,
    notes: row.notes.trim() || null,
  };
}

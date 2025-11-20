import { z } from 'zod';

/**
 * Validation schemas for Phase 13: Product Cross-Reference System
 * Validates cross-references, OEM part numbers, and vehicle compatibility data
 */

// Reference types enum
export const referenceTypes = ['alternative', 'supersedes', 'compatible'] as const;

/**
 * Cross Reference Schema
 * Validates part cross-reference data for alternative/compatible parts
 */
export const crossReferenceSchema = z.object({
  referenceType: z.enum(referenceTypes, {
    message: 'Reference type must be alternative, supersedes, or compatible',
  }),
  
  brandName: z.string()
    .min(1, 'Brand name is required')
    .max(100, 'Brand name must not exceed 100 characters'),
  
  partNumber: z.string()
    .min(1, 'Part number is required')
    .max(100, 'Part number must not exceed 100 characters'),
  
  referencedPartId: z.string()
    .optional()
    .nullable(),
  
  notes: z.string()
    .max(500, 'Notes must not exceed 500 characters')
    .optional()
    .nullable(),
});

/**
 * OEM Part Number Schema
 * Validates manufacturer part number data
 */
export const oemPartNumberSchema = z.object({
  manufacturer: z.string()
    .min(1, 'Manufacturer name is required')
    .max(100, 'Manufacturer name must not exceed 100 characters'),
  
  oemPartNumber: z.string()
    .min(1, 'OEM part number is required')
    .max(100, 'OEM part number must not exceed 100 characters'),
  
  notes: z.string()
    .max(500, 'Notes must not exceed 500 characters')
    .optional()
    .nullable(),
});

/**
 * Vehicle Compatibility Schema
 * Validates vehicle fitment data with year range validation
 */
export const vehicleCompatibilitySchema = z.object({
  make: z.string()
    .min(1, 'Vehicle make is required')
    .max(50, 'Make must not exceed 50 characters'),
  
  model: z.string()
    .min(1, 'Vehicle model is required')
    .max(50, 'Model must not exceed 50 characters'),
  
  yearStart: z.number()
    .int('Start year must be a whole number')
    .min(1900, 'Start year must be 1900 or later')
    .max(2100, 'Start year must be 2100 or earlier'),
  
  yearEnd: z.number()
    .int('End year must be a whole number')
    .min(1900, 'End year must be 1900 or later')
    .max(2100, 'End year must be 2100 or earlier'),
  
  engine: z.string()
    .max(100, 'Engine description must not exceed 100 characters')
    .optional()
    .nullable(),
  
  trim: z.string()
    .max(100, 'Trim must not exceed 100 characters')
    .optional()
    .nullable(),
  
  position: z.string()
    .max(50, 'Position must not exceed 50 characters')
    .optional()
    .nullable(),
  
  notes: z.string()
    .max(500, 'Notes must not exceed 500 characters')
    .optional()
    .nullable(),
}).refine((data) => data.yearEnd >= data.yearStart, {
  message: 'End year must be greater than or equal to start year',
  path: ['yearEnd'],
});

// Type exports for TypeScript
export type CrossReferenceInput = z.infer<typeof crossReferenceSchema>;
export type OEMPartNumberInput = z.infer<typeof oemPartNumberSchema>;
export type VehicleCompatibilityInput = z.infer<typeof vehicleCompatibilitySchema>;

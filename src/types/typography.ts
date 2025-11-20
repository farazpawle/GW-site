/**
 * Typography Type System for Homepage CMS
 * Provides centralized typography controls for all text elements
 */

import { z } from 'zod';

// ============================================================================
// Font Families
// ============================================================================

export const FONT_FAMILIES = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Montserrat',
  'Poppins',
  'Lato',
  'Raleway',
  'Playfair Display',
  'Merriweather',
] as const;

export type FontFamily = typeof FONT_FAMILIES[number];

// ============================================================================
// Font Weights
// ============================================================================

export const FONT_WEIGHTS = [
  '300', // Light
  '400', // Regular
  '500', // Medium
  '600', // Semi-bold
  '700', // Bold
  '800', // Extra-bold
] as const;

export type FontWeight = typeof FONT_WEIGHTS[number];

// ============================================================================
// Font Size Presets
// ============================================================================

export const FONT_SIZE_PRESETS = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
  '5xl': '3rem',    // 48px
  '6xl': '3.75rem', // 60px
  '7xl': '4.5rem',  // 72px
} as const;

export type FontSizePreset = keyof typeof FONT_SIZE_PRESETS;

// ============================================================================
// Text Style Interface
// ============================================================================

export interface TextStyle {
  fontFamily?: FontFamily;
  fontSize?: string; // Supports custom values like '16px', '1.5rem', or presets
  color?: string; // Hex color code
  fontWeight?: FontWeight;
  lineHeight?: string; // e.g., '1.5', '1.75', '2'
}

// ============================================================================
// Zod Validation Schemas
// ============================================================================

export const textStyleSchema = z.object({
  fontFamily: z.enum(FONT_FAMILIES).optional(),
  fontSize: z.string().optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color').optional(),
  fontWeight: z.enum(FONT_WEIGHTS).optional(),
  lineHeight: z.string().optional(),
}).optional();

// ============================================================================
// Default Text Styles
// ============================================================================

export const DEFAULT_TEXT_STYLES = {
  heading: {
    fontFamily: 'Montserrat' as FontFamily,
    fontWeight: '700' as FontWeight,
    color: '#ffffff',
  },
  subheading: {
    fontFamily: 'Montserrat' as FontFamily,
    fontWeight: '600' as FontWeight,
    color: '#ffffff',
  },
  body: {
    fontFamily: 'Inter' as FontFamily,
    fontWeight: '400' as FontWeight,
    color: '#d1d5db', // gray-300
  },
  accent: {
    fontFamily: 'Poppins' as FontFamily,
    fontWeight: '600' as FontWeight,
    color: '#6e0000', // brand-maroon
  },
} as const;

// ============================================================================
// Helper Types
// ============================================================================

export type TextStylePreset = keyof typeof DEFAULT_TEXT_STYLES;

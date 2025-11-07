/**
 * Typography Utility Functions
 * Helper functions for applying text styles dynamically
 */

import { TextStyle } from '@/types/typography';
import { CSSProperties } from 'react';

/**
 * Converts TextStyle object to React CSSProperties
 * @param textStyle - Optional TextStyle configuration
 * @returns CSSProperties object for inline styling
 */
export function applyTextStyles(textStyle?: TextStyle): CSSProperties {
  if (!textStyle) return {};

  const styles: CSSProperties = {};

  if (textStyle.fontFamily) {
    styles.fontFamily = textStyle.fontFamily;
  }

  if (textStyle.fontSize) {
    styles.fontSize = textStyle.fontSize;
  }

  if (textStyle.color) {
    styles.color = textStyle.color;
  }

  if (textStyle.fontWeight) {
    styles.fontWeight = textStyle.fontWeight;
  }

  if (textStyle.lineHeight) {
    styles.lineHeight = textStyle.lineHeight;
  }

  return styles;
}

/**
 * Merges multiple text styles with priority (later styles override earlier)
 * @param styles - Array of optional TextStyle objects
 * @returns Merged CSSProperties
 */
export function mergeTextStyles(...styles: (TextStyle | undefined)[]): CSSProperties {
  return styles.reduce((acc, style) => {
    return { ...acc, ...applyTextStyles(style) };
  }, {} as CSSProperties);
}

/**
 * Checks if a TextStyle has any properties defined
 * @param textStyle - TextStyle to check
 * @returns true if any style property is defined
 */
export function hasTextStyles(textStyle?: TextStyle): boolean {
  if (!textStyle) return false;
  return !!(
    textStyle.fontFamily ||
    textStyle.fontSize ||
    textStyle.color ||
    textStyle.fontWeight ||
    textStyle.lineHeight
  );
}

/**
 * Creates a className string for Google Fonts import
 * @param fontFamilies - Array of font family names
 * @returns Google Fonts URL
 */
export function generateGoogleFontsUrl(fontFamilies: string[]): string {
  if (fontFamilies.length === 0) return '';
  
  const families = fontFamilies
    .map(font => font.replace(/ /g, '+'))
    .join('&family=');
  
  return `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
}

/**
 * Validates hex color code
 * @param color - Color string to validate
 * @returns true if valid hex color
 */
export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

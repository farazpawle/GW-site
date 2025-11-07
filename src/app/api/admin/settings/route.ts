/**
 * Phase 9: Site Settings API
 * 
 * GET /api/admin/settings - List all settings or filter by category
 * PUT /api/admin/settings - Bulk update multiple settings
 * 
 * Note: Legacy SiteSettings API maintained below for backward compatibility
 */

import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/rbac/guards';
import { getSettings, getMediaSettingUrl, isMediaSettingKey } from '@/lib/settings/settings-manager';
import { SettingsCategory } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { PERMISSIONS } from '@/lib/rbac/permissions';

/**
 * GET /api/admin/settings
 * List all settings or filter by category
 * 
 * @example
 * GET /api/admin/settings
 * Response: { "site_name": "Garrit Wulf", "contact_email": "info@...", ... }
 * 
 * @example
 * GET /api/admin/settings?category=GENERAL
 * Response: { "site_name": "Garrit Wulf", "site_tagline": "...", ... }
 */
export async function GET(request: NextRequest) {
  try {
    // Require settings.view permission
    const userOrError = await requirePermission(PERMISSIONS.SETTINGS_VIEW);
    if (userOrError instanceof NextResponse) return userOrError;

    // Get category from query params (optional)
    const searchParams = request.nextUrl.searchParams;
    const categoryParam = searchParams.get('category');

    // Validate category if provided
    let category: SettingsCategory | undefined;
    if (categoryParam) {
      const validCategories = [
        'GENERAL',
        'CONTACT',
        'SEO',
        'SHIPPING',
      ];

      if (!validCategories.includes(categoryParam)) {
        return NextResponse.json(
          { 
            error: 'Invalid category',
            message: `Category must be one of: ${validCategories.join(', ')}`
          },
          { status: 400 }
        );
      }

      category = categoryParam as SettingsCategory;
    }

    // Fetch settings (uses cache if available)
    const settings = await getSettings(category);

    const mediaEntries = await Promise.all(
      Object.entries(settings)
        .filter(([key]) => isMediaSettingKey(key))
        .map(async ([key, value]) => [key, await getMediaSettingUrl(key, value)] as const)
    );

    const mediaPreviews = Object.fromEntries(mediaEntries);

    // Return settings as key-value object
    return NextResponse.json(
      {
        success: true,
        data: settings,
        mediaPreviews,
        category: category || 'all',
        count: Object.keys(settings).length
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'private, max-age=60', // Browser cache for 60 seconds
        }
      }
    );

  } catch (error) {
    console.error('[Settings API] GET error:', error);

    // Check for authorization error
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: error.message
        },
        { status: 403 }
      );
    }

    // Check if it's a redirect error (from requireSuperAdmin in page routes)
    if (error && typeof error === 'object' && 'digest' in error) {
      // Next.js redirect - let it propagate
      throw error;
    }

    return NextResponse.json(
      { 
        error: 'Failed to fetch settings',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/settings
 * Bulk update multiple settings with transaction safety
 * 
 * @example
 * PUT /api/admin/settings
 * Body: { "site_name": "New Name", "contact_email": "new@email.com" }
 * Response: { "success": true, "updated": 2, "keys": ["site_name", "contact_email"] }
 */

import { z } from 'zod';
import { updateSettings, clearCache } from '@/lib/settings/settings-manager';
import { clearSettingsCache } from '@/lib/settings';

// Validation schema: object with string keys and string values
const bulkUpdateSchema = z.record(z.string(), z.string());

export async function PUT(request: NextRequest) {
  try {
    // Require settings.edit permission
    const userOrError = await requirePermission(PERMISSIONS.SETTINGS_EDIT);
    if (userOrError instanceof NextResponse) return userOrError;
    const user = userOrError;

    // Parse request body
    const body = await request.json();

    // Validate: must be an object with string key-value pairs
    const validationResult = bulkUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          message: 'Body must be an object with string key-value pairs',
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const updates = validationResult.data;

    // Check if updates object is empty
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        {
          error: 'Empty update',
          message: 'At least one setting must be provided'
        },
        { status: 400 }
      );
    }

    // Update settings (uses transaction for atomicity)
    // Sensitive fields are automatically encrypted
    await updateSettings(updates, user.id);

    // CRITICAL: Product card settings must ALSO be saved to SiteSettings table
    // (The API reads from SiteSettings, but admin was only saving to Settings table)
    const productCardUpdates = Object.entries(updates)
      .filter(([key]) => key.startsWith('product_card_'));
    
    if (productCardUpdates.length > 0) {
      console.log(`🎴 Syncing ${productCardUpdates.length} product_card settings to SiteSettings table...`);
      
      for (const [key, value] of productCardUpdates) {
        await prisma.siteSettings.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
      }
      
      console.log('✅ SiteSettings sync complete');
    }

    // Clear BOTH cache systems to ensure fresh data
    clearCache(); // settings-manager cache
    clearSettingsCache(); // settings.ts cache (for product card settings)

    return NextResponse.json(
      {
        success: true,
        message: 'Settings updated successfully',
        updated: Object.keys(updates).length,
        keys: Object.keys(updates)
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[Settings API] PUT error:', error);

    // Check for authorization error
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: error.message
        },
        { status: 403 }
      );
    }

    // Check if it's a redirect error (from requireSuperAdmin in page routes)
    if (error && typeof error === 'object' && 'digest' in error) {
      // Next.js redirect - let it propagate
      throw error;
    }

    // Check for validation errors from updateSettings
    if (error instanceof Error && error.message.includes('does not exist')) {
      return NextResponse.json(
        {
          error: 'Invalid setting key',
          message: error.message
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to update settings',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Phase 9: Site Settings API - Single Setting CRUD
 * 
 * GET /api/admin/settings/[key] - Retrieve single setting
 * PUT /api/admin/settings/[key] - Update single setting
 * 
 * @example
 * GET /api/admin/settings/site_name
 * Response: { "key": "site_name", "value": "Garrit Wulf", "category": "GENERAL" }
 * 
 * @example
 * PUT /api/admin/settings/site_name
 * Body: { "value": "New Name" }
 * Response: { "success": true, "key": "site_name", "value": "New Name" }
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/admin/auth';
import { getSetting, updateSetting } from '@/lib/settings/settings-manager';
import { z } from 'zod';

type RouteParams = {
  params: Promise<{ key: string }>;
};

/**
 * GET /api/admin/settings/[key]
 * Retrieve a single setting by key
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Require SUPER_ADMIN role (API route mode)
    await requireSuperAdmin(true);

    // Get key from route params (awaited in Next.js 15)
    const { key } = await params;

    // Validate key is not empty
    if (!key || key.trim() === '') {
      return NextResponse.json(
        {
          error: 'Invalid key',
          message: 'Setting key cannot be empty'
        },
        { status: 400 }
      );
    }

    // Fetch setting value (automatically decrypts if sensitive)
    const value = await getSetting(key);

    // Return 404 if setting doesn't exist
    if (value === null) {
      return NextResponse.json(
        {
          error: 'Setting not found',
          message: `Setting with key '${key}' does not exist`
        },
        { status: 404 }
      );
    }

    // Return setting with key and value
    return NextResponse.json(
      {
        success: true,
        data: {
          key,
          value
        }
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'private, max-age=60',
        }
      }
    );

  } catch (error) {
    console.error('[Settings API] GET [key] error:', error);

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
      throw error;
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch setting',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/settings/[key]
 * Update a single setting by key
 */

// Validation schema for update request
const updateSettingSchema = z.object({
  value: z.string(),
  category: z.enum(['GENERAL', 'CONTACT', 'SEO', 'EMAIL', 'PAYMENT', 'SHIPPING']).optional()
});

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Require SUPER_ADMIN role (API route mode)
    const user = await requireSuperAdmin(true);

    // Get key from route params
    const { key } = await params;

    // Validate key is not empty
    if (!key || key.trim() === '') {
      return NextResponse.json(
        {
          error: 'Invalid key',
          message: 'Setting key cannot be empty'
        },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate body contains value
    const validationResult = updateSettingSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          message: 'Body must contain "value" as a string, and optionally "category"',
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const { value, category } = validationResult.data;

    // Update setting (creates if doesn't exist via upsert)
    // Automatically encrypts if sensitive field
    const updatedSetting = await updateSetting(key, value, user.id, category);

    // Check if update failed
    if (!updatedSetting) {
      return NextResponse.json(
        {
          error: 'Update failed',
          message: 'Failed to update setting in database'
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Setting updated successfully',
        data: {
          key: updatedSetting.key,
          value: updatedSetting.value,
          category: updatedSetting.category
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[Settings API] PUT [key] error:', error);

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
      throw error;
    }

    // Check for validation errors
    if (error instanceof Error) {
      // Handle specific error messages from updateSetting
      if (error.message.includes('Category is required')) {
        return NextResponse.json(
          {
            error: 'Missing category',
            message: 'Category is required when creating a new setting'
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to update setting',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

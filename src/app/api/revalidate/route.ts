import { NextRequest, NextResponse } from 'next/server';
import { checkPermission } from '@/lib/auth';
import { clearPattern } from '@/lib/cache';

export const dynamic = 'force-dynamic';

/**
 * POST /api/revalidate
 * Manual cache invalidation endpoint for admin users
 * 
 * Request body:
 * {
 *   "resource": "products" | "categories" | "pages" | "homepage" | "all"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin permission
    const user = await checkPermission('dashboard.view');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { resource } = body;

    // Validate resource parameter
    const validResources = ['products', 'categories', 'pages', 'homepage', 'all'];
    if (!resource || !validResources.includes(resource)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid resource parameter',
          message: `Resource must be one of: ${validResources.join(', ')}`
        },
        { status: 400 }
      );
    }

    let clearedCount = 0;
    const clearedKeys: string[] = [];

    // Clear cache based on resource type
    switch (resource) {
      case 'products':
        clearedCount += await clearPattern('products:*');
        clearedKeys.push('products:*');
        break;

      case 'categories':
        clearedCount += await clearPattern('categories:*');
        clearedCount += await clearPattern('products:*');
        clearedKeys.push('categories:*', 'products:*');
        break;

      case 'pages':
        clearedCount += await clearPattern('page:*');
        clearedKeys.push('page:*');
        break;

      case 'homepage':
        clearedCount += await clearPattern('homepage:*');
        clearedKeys.push('homepage:*');
        break;

      case 'all':
        clearedCount += await clearPattern('products:*');
        clearedCount += await clearPattern('categories:*');
        clearedCount += await clearPattern('page:*');
        clearedCount += await clearPattern('homepage:*');
        clearedKeys.push('products:*', 'categories:*', 'page:*', 'homepage:*');
        break;
    }

    console.log(`[Revalidate] Cleared ${clearedCount} cache keys for resource: ${resource}`);

    return NextResponse.json({
      success: true,
      message: `Successfully cleared ${resource} cache`,
      data: {
        resource,
        clearedCount,
        patterns: clearedKeys,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('[Revalidate] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to revalidate cache',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

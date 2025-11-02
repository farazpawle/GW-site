import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stringify } from 'csv-stringify/sync';
import { CSV_HEADERS, exportProductToCSV } from '@/lib/csv-utils';
import { Prisma } from '@prisma/client';

/**
 * GET /api/admin/products/export
 * Export products to CSV with optional filtering
 * 
 * Query params:
 * - filter: 'all' | 'published' | 'draft' | 'featured'
 * - categoryId: string (optional)
 * - search: string (optional)
 * - ids: comma-separated string of product IDs (optional)
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const filter = searchParams.get('filter') || 'all';
    const categoryId = searchParams.get('categoryId') || '';
    const search = searchParams.get('search') || '';
    const idsParam = searchParams.get('ids') || '';
    const ids = idsParam ? idsParam.split(',').filter(id => id.trim().length > 0) : [];

    // Build WHERE clause
    const where: Prisma.PartWhereInput = {
      AND: [
        // IDs filter (for selected products export)
        ids.length > 0 ? { id: { in: ids } } : {},
        
        // Status filter
        filter === 'published' ? { published: true } :
        filter === 'draft' ? { published: false } :
        filter === 'featured' ? { featured: true } : {},
        
        // Category filter
        categoryId ? { categoryId } : {},
        
        // Search filter
        search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { partNumber: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } },
          ],
        } : {},
      ],
    };

    // Fetch products with category relation
    const products = await prisma.part.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform products to CSV rows
    const csvRows = products.map(product => 
      exportProductToCSV(product, product.category.name)
    );

    // Generate CSV with headers
    const csv = stringify(csvRows, {
      header: true,
      columns: CSV_HEADERS as unknown as string[],
    });

    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const filename = `products-${date}.csv`;

    // Return as downloadable file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('Error exporting products:', error);
    
    // Check if it's an auth error
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to export products' },
      { status: 500 }
    );
  }
}

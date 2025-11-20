import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stringify } from 'csv-stringify/sync';
import { CROSS_REFERENCE_CSV_HEADERS, exportCrossReferenceToCSV } from '@/lib/csv-utils';

/**
 * GET /api/admin/products/export/cross-reference
 * Export cross references to CSV
 * 
 * Query params:
 * - productSKU: string (optional) - Export for specific product only
 */
export async function GET(request: NextRequest) {
  try {
    const user = await checkAdmin();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productSKU = searchParams.get('productSKU') || '';

    // Build WHERE clause
    const where = productSKU
      ? { part: { sku: productSKU } }
      : {};

    // Fetch cross references with product relation
    const crossReferences = await prisma.partCrossReference.findMany({
      where,
      include: {
        part: {
          select: {
            sku: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform to CSV rows
    const csvRows = crossReferences.map(crossRef =>
      exportCrossReferenceToCSV(crossRef)
    );

    // Generate CSV with headers
    const csv = stringify(csvRows, {
      header: true,
      columns: CROSS_REFERENCE_CSV_HEADERS as unknown as string[],
    });

    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const filename = productSKU
      ? `cross-references-${productSKU}-${date}.csv`
      : `cross-references-${date}.csv`;

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
    console.error('Error exporting cross references:', error);

    // Check if it's an auth error
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to export cross references' },
      { status: 500 }
    );
  }
}

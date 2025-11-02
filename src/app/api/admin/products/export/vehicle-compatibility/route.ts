import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stringify } from 'csv-stringify/sync';
import { VEHICLE_COMPATIBILITY_CSV_HEADERS, exportVehicleCompatibilityToCSV } from '@/lib/csv-utils';

/**
 * GET /api/admin/products/export/vehicle-compatibility
 * Export vehicle compatibility to CSV
 * 
 * Query params:
 * - productSKU: string (optional) - Export for specific product only
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const productSKU = searchParams.get('productSKU') || '';

    // Build WHERE clause
    const where = productSKU
      ? { part: { sku: productSKU } }
      : {};

    // Fetch vehicle compatibility with product relation
    const vehicleCompatibility = await prisma.vehicleCompatibility.findMany({
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
    const csvRows = vehicleCompatibility.map(vehicle =>
      exportVehicleCompatibilityToCSV(vehicle)
    );

    // Generate CSV with headers
    const csv = stringify(csvRows, {
      header: true,
      columns: VEHICLE_COMPATIBILITY_CSV_HEADERS as unknown as string[],
    });

    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const filename = productSKU
      ? `vehicle-compatibility-${productSKU}-${date}.csv`
      : `vehicle-compatibility-${date}.csv`;

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
    console.error('Error exporting vehicle compatibility:', error);

    // Check if it's an auth error
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to export vehicle compatibility' },
      { status: 500 }
    );
  }
}

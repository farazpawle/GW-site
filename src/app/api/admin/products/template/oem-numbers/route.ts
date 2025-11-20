import { NextResponse } from 'next/server';
import { stringify } from 'csv-stringify/sync';
import { OEM_NUMBER_CSV_HEADERS } from '@/lib/csv-utils';

/**
 * GET /api/admin/products/template/oem-numbers
 * Download CSV template for OEM Numbers import
 */
export async function GET() {
  try {
    // Create sample data with explanatory values
    const sampleData = [
      {
        productSKU: 'PROD-001',
        manufacturer: 'Toyota',
        oemPartNumber: '12345-67890',
        notes: 'Original equipment manufacturer part',
      },
      {
        productSKU: 'PROD-001',
        manufacturer: 'Honda',
        oemPartNumber: '98765-43210',
        notes: 'Compatible OEM alternative',
      },
    ];

    // Generate CSV
    const csv = stringify(sampleData, {
      header: true,
      columns: OEM_NUMBER_CSV_HEADERS as unknown as string[],
    });

    // Return as downloadable file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="oem-numbers-template.csv"',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('Error generating template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate template' },
      { status: 500 }
    );
  }
}

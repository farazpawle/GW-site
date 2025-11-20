import { NextResponse } from 'next/server';
import { stringify } from 'csv-stringify/sync';
import { CROSS_REFERENCE_CSV_HEADERS } from '@/lib/csv-utils';

/**
 * GET /api/admin/products/template/cross-reference
 * Download CSV template for Cross Reference import
 */
export async function GET() {
  try {
    // Create sample data with explanatory values
    const sampleData = [
      {
        productSKU: 'PROD-001',
        referenceType: 'OEM',
        brandName: 'Manufacturer A',
        partNumber: 'MFG-A-12345',
        notes: 'Direct replacement',
      },
      {
        productSKU: 'PROD-001',
        referenceType: 'Aftermarket',
        brandName: 'Brand B',
        partNumber: 'BRB-98765',
        notes: 'Compatible alternative',
      },
    ];

    // Generate CSV
    const csv = stringify(sampleData, {
      header: true,
      columns: CROSS_REFERENCE_CSV_HEADERS as unknown as string[],
    });

    // Return as downloadable file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="cross-reference-template.csv"',
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

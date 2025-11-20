import { NextResponse } from 'next/server';
import { stringify } from 'csv-stringify/sync';
import { VEHICLE_COMPATIBILITY_CSV_HEADERS } from '@/lib/csv-utils';

/**
 * GET /api/admin/products/template/vehicle-compatibility
 * Download CSV template for Vehicle Compatibility import
 */
export async function GET() {
  try {
    // Create sample data with explanatory values
    const sampleData = [
      {
        productSKU: 'PROD-001',
        make: 'Toyota',
        model: 'Camry',
        yearStart: '2018',
        yearEnd: '2023',
        engine: '2.5L I4',
        trim: 'LE, SE, XLE',
        position: 'Front',
        notes: 'All trims except hybrid',
      },
      {
        productSKU: 'PROD-001',
        make: 'Honda',
        model: 'Accord',
        yearStart: '2019',
        yearEnd: '2024',
        engine: '1.5L Turbo',
        trim: 'Sport',
        position: 'Rear',
        notes: 'Sport trim only',
      },
    ];

    // Generate CSV
    const csv = stringify(sampleData, {
      header: true,
      columns: VEHICLE_COMPATIBILITY_CSV_HEADERS as unknown as string[],
    });

    // Return as downloadable file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="vehicle-compatibility-template.csv"',
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

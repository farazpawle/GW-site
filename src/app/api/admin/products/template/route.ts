import { NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/auth';
import { stringify } from 'csv-stringify/sync';
import { CSV_HEADERS } from '@/lib/csv-utils';

/**
 * GET /api/admin/products/template
 * Download CSV template with headers and example row
 */
export async function GET() {
  try {
    const user = await checkAdmin();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Example row with sample data for all fields
    const exampleRow = {
      name: 'Brake Pad Set - Front',
      sku: 'BRK-001',
      partNumber: 'BP-12345',
      price: '45.99',
      comparePrice: '59.99',
      compareAtPrice: '69.99',
      description: 'High-quality ceramic brake pads for superior stopping power. Features low dust formula and quiet operation.',
      shortDesc: 'Premium ceramic brake pads with low dust formula',
      category: 'Brake Systems',
      brand: 'Brembo',
      origin: 'Germany',
      warranty: '2 years',
      difficulty: 'Easy',
      tags: 'brake|safety|ceramic',
      compatibility: 'Toyota Camry|Honda Accord|Nissan Altima',
      application: 'sedan|coupe',
      certifications: 'ISO 9001|DOT Certified',
      images: 'products/brake-123.jpg|products/brake-456.jpg',
      specifications: '{"material":"ceramic","thickness":"12mm","weight":"2.5kg"}',
      videoUrl: 'https://youtube.com/watch?v=example',
      pdfUrl: 'https://example.com/manual.pdf',
      featured: 'true',
      published: 'true',
      publishedAt: '2025-10-18T00:00:00.000Z',
      showcaseOrder: '10',
      views: '0',
      hasVariants: 'false',
    };

    // Generate CSV with headers and example row
    const csv = stringify([exampleRow], {
      header: true,
      columns: CSV_HEADERS as unknown as string[],
    });

    // Return as downloadable file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="products-template.csv"',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('Error generating template:', error);
    
    // Check if it's an auth error
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to generate template' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parse } from 'csv-parse/sync';
import { parseCSVRow, validateCSVRow, ValidationError, ValidationWarning } from '@/lib/csv-utils';

/**
 * POST /api/admin/products/import/validate
 * Validate CSV file before import
 * 
 * Form data:
 * - file: CSV file to validate
 * 
 * Returns:
 * - preview: First 10 rows
 * - validation: { valid, errors, warnings }
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { success: false, error: 'File must be a CSV' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size must not exceed 10MB' },
        { status: 400 }
      );
    }

    // Read file content
    const fileContent = await file.text();

    // Parse CSV
    let records: Record<string, string>[];
    try {
      records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid CSV format' },
        { status: 400 }
      );
    }

    if (records.length === 0) {
      return NextResponse.json(
        { success: false, error: 'CSV file is empty' },
        { status: 400 }
      );
    }

    // Fetch all categories for validation
    const categories = await prisma.category.findMany({
      select: { id: true, name: true },
    });
    const categoryMap = new Map<string, string>();
    categories.forEach(cat => {
      categoryMap.set(cat.name.toLowerCase(), cat.id);
    });

    // Fetch all existing SKUs for duplicate detection
    const existingParts = await prisma.part.findMany({
      select: { sku: true },
    });
    const existingSKUs = new Set(existingParts.map(p => p.sku));

    // Validate each row
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationWarning[] = [];
    const skusInFile = new Set<string>();
    let validCount = 0;

    records.forEach((record, index) => {
      const rowIndex = index + 2; // +2 because CSV row 1 is headers, array is 0-indexed
      const row = parseCSVRow(record);

      // Check for duplicate SKUs within the file
      if (row.sku && skusInFile.has(row.sku)) {
        allErrors.push({
          row: rowIndex,
          field: 'sku',
          message: `Duplicate SKU "${row.sku}" found in file`,
        });
      } else if (row.sku) {
        skusInFile.add(row.sku);
      }

      // Validate row
      const { errors, warnings } = validateCSVRow(
        row,
        rowIndex,
        existingSKUs,
        categoryMap
      );

      if (errors.length === 0) {
        validCount++;
      }

      allErrors.push(...errors);
      allWarnings.push(...warnings);
    });

    // Prepare preview (first 10 rows)
    const preview = records.slice(0, 10).map((record, index) => ({
      rowNumber: index + 2,
      data: parseCSVRow(record),
    }));

    // Return validation results
    return NextResponse.json({
      success: true,
      preview,
      validation: {
        totalRows: records.length,
        valid: validCount,
        invalid: records.length - validCount,
        errors: allErrors,
        warnings: allWarnings,
      },
    });

  } catch (error) {
    console.error('Error validating import:', error);
    
    // Check if it's an auth error
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to validate import file' },
      { status: 500 }
    );
  }
}

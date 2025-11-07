import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parse } from 'csv-parse/sync';
import { 
  parseVehicleCompatibilityCSVRow, 
  validateVehicleCompatibilityCSVRow, 
  ValidationError, 
  ValidationWarning 
} from '@/lib/csv-utils';

/**
 * POST /api/admin/products/import/vehicle-compatibility/validate
 * Validate Vehicle Compatibility CSV file before import
 */
export async function POST(request: NextRequest) {
  try {
    const user = await checkAdmin();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { success: false, error: 'File must be a CSV' },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size must not exceed 10MB' },
        { status: 400 }
      );
    }

    const fileContent = await file.text();

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

    // Fetch all existing product SKUs for validation
    const existingParts = await prisma.part.findMany({
      select: { sku: true },
    });
    const existingSKUs = new Set(existingParts.map(p => p.sku));

    // Validate each row
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationWarning[] = [];
    let validCount = 0;

    records.forEach((record, index) => {
      const rowIndex = index + 2;
      const row = parseVehicleCompatibilityCSVRow(record);

      const { errors, warnings } = validateVehicleCompatibilityCSVRow(
        row,
        rowIndex,
        existingSKUs
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
      data: parseVehicleCompatibilityCSVRow(record),
    }));

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
    console.error('Error validating vehicle compatibility import:', error);

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

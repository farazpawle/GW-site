import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parse } from 'csv-parse/sync';
import { 
  parseVehicleCompatibilityCSVRow, 
  validateVehicleCompatibilityCSVRow, 
  transformCSVToVehicleCompatibility,
  ValidationError 
} from '@/lib/csv-utils';

/**
 * POST /api/admin/products/import/vehicle-compatibility/execute
 * Execute Vehicle Compatibility CSV import
 * 
 * Mode: Always uses upsert logic (delete existing + create new for each product)
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

    let created = 0;
    let failed = 0;
    const errors: ValidationError[] = [];

    await prisma.$transaction(async (tx) => {
      // Fetch all existing product SKUs and IDs
      const existingParts = await tx.part.findMany({
        select: { id: true, sku: true },
      });
      const skuToIdMap = new Map<string, string>();
      existingParts.forEach(part => {
        skuToIdMap.set(part.sku, part.id);
      });
      const existingSKUs = new Set(skuToIdMap.keys());

      // Group records by product SKU
      const recordsByProduct = new Map<string, typeof records>();
      records.forEach(record => {
        const row = parseVehicleCompatibilityCSVRow(record);
        const sku = row.productSKU.trim();
        if (!recordsByProduct.has(sku)) {
          recordsByProduct.set(sku, []);
        }
        recordsByProduct.get(sku)!.push(record);
      });

      // Process each product's vehicle compatibility
      for (const [sku, productRecords] of recordsByProduct) {
        const partId = skuToIdMap.get(sku);
        
        if (!partId) {
          // Skip all records for this product
          productRecords.forEach((_, index) => {
            failed++;
            errors.push({
              row: index + 2,
              field: 'productSKU',
              message: `Product with SKU "${sku}" not found`,
            });
          });
          continue;
        }

        // Delete existing vehicle compatibility for this product
        await tx.vehicleCompatibility.deleteMany({
          where: { partId },
        });

        // Process each record for this product
        for (let i = 0; i < productRecords.length; i++) {
          const record = productRecords[i];
          const rowIndex = records.indexOf(record) + 2;

          try {
            const row = parseVehicleCompatibilityCSVRow(record);

            const { errors: validationErrors } = validateVehicleCompatibilityCSVRow(
              row,
              rowIndex,
              existingSKUs
            );

            if (validationErrors.length > 0) {
              failed++;
              errors.push(...validationErrors);
              continue;
            }

            const vehicleData = transformCSVToVehicleCompatibility(row, partId);
            await tx.vehicleCompatibility.create({
              data: vehicleData,
            });
            created++;

          } catch (error) {
            failed++;
            console.error(`Error processing row ${rowIndex}:`, error);
            errors.push({
              row: rowIndex,
              field: 'general',
              message: error instanceof Error ? error.message : 'Unknown error occurred',
            });
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      results: {
        total: records.length,
        created,
        updated: 0,
        failed,
        errors,
      },
    });

  } catch (error) {
    console.error('Error executing vehicle compatibility import:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to execute import. All changes have been rolled back.' },
      { status: 500 }
    );
  }
}

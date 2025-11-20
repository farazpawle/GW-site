import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parse } from 'csv-parse/sync';
import { 
  parseCSVRow, 
  validateCSVRow, 
  transformCSVToProduct,
  resolveCategoryByName,
  generateUniqueSlug,
  ValidationError 
} from '@/lib/csv-utils';

/**
 * POST /api/admin/products/import/execute
 * Execute CSV import with specified mode
 * 
 * Form data:
 * - file: CSV file to import
 * - mode: 'create' | 'update' | 'upsert'
 * 
 * Modes:
 * - create: Only create new products (error if SKU exists)
 * - update: Only update existing products (error if SKU not found)
 * - upsert: Create new or update existing by SKU
 * 
 * Returns:
 * - created: number of products created
 * - updated: number of products updated
 * - failed: number of failed operations
 * - errors: array of error details
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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const mode = formData.get('mode') as string;

    // Validate inputs
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!mode || !['create', 'update', 'upsert'].includes(mode)) {
      return NextResponse.json(
        { success: false, error: 'Invalid mode. Must be: create, update, or upsert' },
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

    // Read and parse CSV
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

    // Prepare tracking
    let created = 0;
    let updated = 0;
    let failed = 0;
    const errors: ValidationError[] = [];

    // Execute import within a transaction for atomicity
    await prisma.$transaction(async (tx) => {
      // Fetch all categories for name-to-ID mapping
      const categories = await tx.category.findMany({
        select: { id: true, name: true },
      });
      const categoryMap = new Map<string, string>();
      categories.forEach(cat => {
        categoryMap.set(cat.name.toLowerCase(), cat.id);
      });

      // Fetch existing products for update/upsert logic
      const existingParts = await tx.part.findMany({
        select: { id: true, sku: true, slug: true },
      });
      const existingSKUMap = new Map<string, { id: string; slug: string }>();
      existingParts.forEach(part => {
        existingSKUMap.set(part.sku, { id: part.id, slug: part.slug });
      });

      // Process each row
      for (let i = 0; i < records.length; i++) {
        const rowIndex = i + 2; // +2 for header and 0-index
        const record = records[i];
        
        try {
          // Parse and validate row
          const row = parseCSVRow(record);
          
          const { errors: validationErrors } = validateCSVRow(
            row,
            rowIndex,
            new Set(existingSKUMap.keys()),
            categoryMap
          );

          // Skip invalid rows
          if (validationErrors.length > 0) {
            failed++;
            errors.push(...validationErrors);
            continue;
          }

          // Resolve category by name
          const categoryId = await resolveCategoryByName(row.category || '');
          
          if (!categoryId) {
            failed++;
            errors.push({
              row: rowIndex,
              field: 'category',
              message: `Category "${row.category}" not found`,
            });
            continue;
          }

          // Check if product exists
          const existingProduct = existingSKUMap.get(row.sku);

          // Mode-specific logic
          if (mode === 'create') {
            // CREATE MODE: Only create new products
            if (existingProduct) {
              failed++;
              errors.push({
                row: rowIndex,
                field: 'sku',
                message: `Product with SKU "${row.sku}" already exists (use 'update' or 'upsert' mode)`,
              });
              continue;
            }

            // Generate unique slug
            const slug = await generateUniqueSlug(row.name);

            // Transform and create
            const productData = transformCSVToProduct(row, categoryId);
            await tx.part.create({
              data: { ...productData, slug },
            });
            created++;

          } else if (mode === 'update') {
            // UPDATE MODE: Only update existing products
            if (!existingProduct) {
              failed++;
              errors.push({
                row: rowIndex,
                field: 'sku',
                message: `Product with SKU "${row.sku}" not found (use 'create' or 'upsert' mode)`,
              });
              continue;
            }

            // Transform and update
            const productData = transformCSVToProduct(row, categoryId);
            
            // Use existing slug if name hasn't changed significantly
            const slug = existingProduct.slug;

            await tx.part.update({
              where: { id: existingProduct.id },
              data: { ...productData, slug },
            });
            updated++;

          } else if (mode === 'upsert') {
            // UPSERT MODE: Create or update by SKU
            if (existingProduct) {
              // Update existing
              const productData = transformCSVToProduct(row, categoryId);
              const slug = existingProduct.slug;

              await tx.part.update({
                where: { id: existingProduct.id },
                data: { ...productData, slug },
              });
              updated++;
            } else {
              // Create new
              const slug = await generateUniqueSlug(row.name);
              const productData = transformCSVToProduct(row, categoryId);

              await tx.part.create({
                data: { ...productData, slug },
              });
              created++;
            }
          }

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
    });

    // Return results
    return NextResponse.json({
      success: true,
      results: {
        total: records.length,
        created,
        updated,
        failed,
        errors,
      },
    });

  } catch (error) {
    console.error('Error executing import:', error);

    // Check if it's an auth error
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Transaction rollback happens automatically on error
    return NextResponse.json(
      { success: false, error: 'Failed to execute import. All changes have been rolled back.' },
      { status: 500 }
    );
  }
}

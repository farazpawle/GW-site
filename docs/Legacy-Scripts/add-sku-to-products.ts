/**
 * Script to add unique SKU values to all existing products
 * This should be run before applying the SKU migration
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generate a unique SKU based on product information
 * Format: PREFIX-CATEGORY_CODE-RANDOM_NUMBER
 */
function generateSKU(partNumber: string, categoryName: string): string {
  // Extract first 3 letters of category (uppercase)
  const categoryCode = categoryName
    .replace(/[^a-zA-Z]/g, '')
    .substring(0, 3)
    .toUpperCase()
    .padEnd(3, 'X');
  
  // Use part number or generate from index
  const productCode = partNumber
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 8)
    .padEnd(8, '0');
  
  // Add random suffix for uniqueness
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  
  return `SKU-${categoryCode}-${productCode}-${randomSuffix}`;
}

async function addSKUToProducts() {
  try {
    console.log('🔍 Fetching all products without SKU...');
    
    // Get all products with their categories
    const products = await prisma.part.findMany({
      include: {
        category: true,
      },
    });

    console.log(`📦 Found ${products.length} products to update`);

    if (products.length === 0) {
      console.log('✅ No products to update');
      return;
    }

    // Track generated SKUs to ensure uniqueness
    const generatedSKUs = new Set<string>();
    let successCount = 0;
    let errorCount = 0;

    // Update each product with a unique SKU
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      try {
        // Generate unique SKU
        let sku = generateSKU(
          product.partNumber,
          product.category?.name || 'UNKNOWN'
        );
        
        // Ensure uniqueness
        let attempts = 0;
        while (generatedSKUs.has(sku) && attempts < 10) {
          sku = generateSKU(product.partNumber, product.category?.name || 'UNKNOWN');
          attempts++;
        }
        
        if (generatedSKUs.has(sku)) {
          console.error(`❌ Could not generate unique SKU for product: ${product.name}`);
          errorCount++;
          continue;
        }
        
        generatedSKUs.add(sku);

        // Update product with SKU
        await prisma.part.update({
          where: { id: product.id },
          data: { sku },
        });

        successCount++;
        console.log(`✓ [${successCount}/${products.length}] Updated "${product.name}" with SKU: ${sku}`);
      } catch (error) {
        console.error(`❌ Error updating product ${product.name}:`, error);
        errorCount++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Successfully updated: ${successCount} products`);
    console.log(`   ❌ Errors: ${errorCount} products`);
    console.log('✨ SKU addition completed!');
  } catch (error) {
    console.error('❌ Fatal error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addSKUToProducts()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

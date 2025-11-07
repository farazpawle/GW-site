/**
 * Script to add dummy SKU values to all products that don't have one
 * SKU format: SKU-{CATEGORY_PREFIX}-{RANDOM_NUMBER}
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Generate a random SKU
function generateSKU(categoryName: string, existingSkus: Set<string>): string {
  // Get first 3 letters of category name
  const prefix = categoryName.substring(0, 3).toUpperCase();
  
  let sku: string;
  let attempts = 0;
  const maxAttempts = 1000;
  
  // Keep generating until we get a unique SKU
  do {
    const randomNum = Math.floor(Math.random() * 900000) + 100000; // 6-digit random number
    sku = `SKU-${prefix}-${randomNum}`;
    attempts++;
    
    if (attempts >= maxAttempts) {
      // If we can't generate a unique SKU, use timestamp
      sku = `SKU-${prefix}-${Date.now()}`;
      break;
    }
  } while (existingSkus.has(sku));
  
  existingSkus.add(sku);
  return sku;
}

async function addDummySkus() {
  console.log('🔄 Starting to add dummy SKUs to products...\n');
  
  try {
    // Get all products without SKUs
    const productsWithoutSku = await prisma.part.findMany({
      where: {
        OR: [
          { sku: '' },
          { sku: { startsWith: '' } }
        ]
      },
      include: {
        category: true
      }
    });
    
    console.log(`📦 Found ${productsWithoutSku.length} products without SKUs\n`);
    
    if (productsWithoutSku.length === 0) {
      console.log('✅ All products already have SKUs!');
      return;
    }
    
    // Get all existing SKUs to avoid duplicates
    const allProducts = await prisma.part.findMany({
      select: { sku: true }
    });
    const existingSkus = new Set(
      allProducts
        .filter(p => p.sku !== null)
        .map(p => p.sku as string)
    );
    
    console.log(`📋 Existing SKUs in database: ${existingSkus.size}\n`);
    
    // Update each product with a unique SKU
    let updated = 0;
    let failed = 0;
    
    for (const product of productsWithoutSku) {
      try {
        const sku = generateSKU(product.category.name, existingSkus);
        
        await prisma.part.update({
          where: { id: product.id },
          data: { sku }
        });
        
        updated++;
        console.log(`✅ [${updated}/${productsWithoutSku.length}] Updated "${product.name}" with SKU: ${sku}`);
      } catch (error) {
        failed++;
        console.error(`❌ Failed to update "${product.name}":`, error);
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`   ✅ Successfully updated: ${updated} products`);
    console.log(`   ❌ Failed: ${failed} products`);
    console.log(`   📦 Total processed: ${productsWithoutSku.length} products`);
    
  } catch (error) {
    console.error('❌ Error during SKU generation:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addDummySkus()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });

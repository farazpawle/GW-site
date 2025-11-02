/**
 * Check ALL products in database to see which ones have missing fields
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllProducts() {
  try {
    console.log('\n🔍 Checking ALL products in database...\n');
    
    const products = await prisma.part.findMany({
      where: {
        published: true,
      },
      include: {
        category: true,
      },
      orderBy: {
        showcaseOrder: 'asc',
      },
    });

    console.log(`Total published products: ${products.length}\n`);

    let missingFieldsCount = 0;

    products.forEach((product, idx) => {
      const hasMissingFields = !product.partNumber || !product.sku || !product.brand || !product.origin || !product.category;
      
      if (hasMissingFields) {
        missingFieldsCount++;
        console.log(`\n❌ Product ${idx + 1}: ${product.name}`);
        console.log('─'.repeat(60));
        if (!product.partNumber) console.log('  ❌ Missing: partNumber');
        if (!product.sku) console.log('  ❌ Missing: sku');
        if (!product.brand) console.log('  ❌ Missing: brand');
        if (!product.origin) console.log('  ❌ Missing: origin');
        if (!product.category) console.log('  ❌ Missing: category');
      } else {
        console.log(`✅ Product ${idx + 1}: ${product.name} - ALL FIELDS OK`);
      }
    });

    console.log(`\n\n📊 Summary:`);
    console.log(`  Total products: ${products.length}`);
    console.log(`  Products with missing fields: ${missingFieldsCount}`);
    console.log(`  Products with all fields: ${products.length - missingFieldsCount}`);

    if (missingFieldsCount > 0) {
      console.log(`\n💡 Recommendation: Re-seed the database with complete data`);
      console.log(`   Run: npx tsx scripts/seed-20-autoparts.ts`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllProducts();

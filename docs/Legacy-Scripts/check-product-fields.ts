/**
 * Check what fields products actually have in database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProductFields() {
  try {
    console.log('\n🔍 Checking product fields in database...\n');
    
    const products = await prisma.part.findMany({
      take: 3,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      where: {
        published: true,
      },
    });

    if (products.length === 0) {
      console.log('❌ No products found in database!');
      console.log('💡 Run: npm run seed:autoparts');
      return;
    }

    products.forEach((product, idx) => {
      console.log(`\n📦 Product ${idx + 1}: ${product.name}`);
      console.log('─'.repeat(60));
      console.log(`  ID:          ${product.id}`);
      console.log(`  Slug:        ${product.slug}`);
      console.log(`  Part Number: ${product.partNumber || '❌ MISSING'}`);
      console.log(`  SKU:         ${product.sku || '❌ MISSING'}`);
      console.log(`  Brand:       ${product.brand || '❌ MISSING'}`);
      console.log(`  Origin:      ${product.origin || '❌ MISSING'}`);
      console.log(`  Category:    ${product.category?.name || '❌ MISSING'}`);
      console.log(`  Price:       $${product.price}`);
      console.log(`  Compare:     $${product.comparePrice || 'N/A'}`);
      console.log(`  Description: ${product.description ? product.description.substring(0, 50) + '...' : '❌ MISSING'}`);
      console.log(`  Tags:        ${product.tags.length > 0 ? product.tags.join(', ') : '❌ MISSING'}`);
    });

    console.log('\n✅ Field check complete!\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProductFields();

import { PrismaClient } from '@prisma/client';
import { DEFAULT_IMAGES } from '../src/lib/default-images';

const prisma = new PrismaClient();

async function fixProductImages() {
  console.log('🔍 Checking products with invalid image paths...\n');

  try {
    // Find all products (Part model)
    const products = await prisma.part.findMany({
      select: {
        id: true,
        name: true,
        images: true,
      },
    });

    console.log(`Found ${products.length} products\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      const images = product.images as string[];
      
      // Check if product has no images or has invalid image paths
      const needsUpdate = 
        !images || 
        images.length === 0 || 
        images.some(img => img.startsWith('/images/products/'));

      if (needsUpdate) {
        console.log(`📝 Updating: ${product.name}`);
        console.log(`   Old images: ${JSON.stringify(images)}`);
        
        await prisma.part.update({
          where: { id: product.id },
          data: {
            images: [DEFAULT_IMAGES.PRODUCT],
          },
        });
        
        console.log(`   New images: ${JSON.stringify([DEFAULT_IMAGES.PRODUCT])}\n`);
        updatedCount++;
      } else {
        console.log(`✓ Skipped: ${product.name} (valid images)`);
        skippedCount++;
      }
    }

    console.log('\n✅ Migration complete!');
    console.log(`   Updated: ${updatedCount} products`);
    console.log(`   Skipped: ${skippedCount} products`);

  } catch (error) {
    console.error('❌ Error fixing product images:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixProductImages()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

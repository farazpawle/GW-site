import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script to mark random products as featured for testing the 3D carousel
 * Run with: npm run tsx scripts/mark-featured-products.ts
 */
async function markFeaturedProducts() {
  try {
    console.log('🔍 Finding published products...');

    // Get all published products
    const publishedProducts = await prisma.part.findMany({
      where: {
        published: true,
      },
      select: {
        id: true,
        name: true,
        partNumber: true,
      },
      take: 20, // Get more than we need
    });

    if (publishedProducts.length === 0) {
      console.log('⚠️  No published products found. Please publish some products first.');
      return;
    }

    console.log(`📦 Found ${publishedProducts.length} published products`);

    // Randomly select 8-12 products to feature
    const numToFeature = Math.min(
      Math.floor(Math.random() * 5) + 8, // 8-12
      publishedProducts.length
    );

    // Shuffle and take the first N products
    const shuffled = publishedProducts.sort(() => Math.random() - 0.5);
    const toFeature = shuffled.slice(0, numToFeature);

    console.log(`⭐ Marking ${toFeature.length} products as featured...`);

    // First, unmark all featured products
    await prisma.part.updateMany({
      where: {
        featured: true,
      },
      data: {
        featured: false,
        showcaseOrder: 999,
      },
    });

    // Mark selected products as featured with random showcase order
    for (let i = 0; i < toFeature.length; i++) {
      const product = toFeature[i];
      await prisma.part.update({
        where: {
          id: product.id,
        },
        data: {
          featured: true,
          showcaseOrder: i + 1,
        },
      });

      console.log(`  ✓ ${i + 1}. ${product.name} (${product.partNumber})`);
    }

    console.log('\n✅ Successfully marked products as featured!');
    console.log('🎨 Visit the homepage to see the 3D carousel in action.');

  } catch (error) {
    console.error('❌ Error marking featured products:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
markFeaturedProducts()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

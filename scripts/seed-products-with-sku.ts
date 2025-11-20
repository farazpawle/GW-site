/**
 * Script to seed sample products with SKU values
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleProducts = [
  {
    name: 'High Performance Brake Pad Set',
    partNumber: 'BP-001',
    sku: 'SKU-BRA-123456',
    description: 'Premium brake pads for high-performance vehicles',
    shortDesc: 'High-performance brake pads',
    price: 89.99,
    categoryName: 'Brakes',
    brand: 'Garrit Wulf',
    tags: ['brake-pads', 'performance', 'safety']
  },
  {
    name: 'Sport Suspension Kit',
    partNumber: 'SK-001',
    sku: 'SKU-SUS-789012',
    description: 'Complete sport suspension system for enhanced handling',
    shortDesc: 'Sport suspension system',
    price: 899.99,
    categoryName: 'Suspension',
    brand: 'Garrit Wulf',
    tags: ['suspension', 'performance', 'handling']
  },
  {
    name: 'Performance Air Filter',
    partNumber: 'AF-001',
    sku: 'SKU-AIR-345678',
    description: 'High-flow air filter for increased engine performance',
    shortDesc: 'High-flow air filter',
    price: 49.99,
    categoryName: 'Engine',
    brand: 'Garrit Wulf',
    tags: ['air-filter', 'engine', 'performance']
  },
  {
    name: 'LED Headlight Upgrade Kit',
    partNumber: 'HL-001',
    sku: 'SKU-LIG-901234',
    description: 'Bright LED headlights for improved visibility',
    shortDesc: 'LED headlight kit',
    price: 299.99,
    categoryName: 'Lighting',
    brand: 'Garrit Wulf',
    tags: ['lighting', 'led', 'safety']
  },
  {
    name: 'Racing Exhaust System',
    partNumber: 'EX-001',
    sku: 'SKU-EXH-567890',
    description: 'Complete racing exhaust for maximum performance and sound',
    shortDesc: 'Racing exhaust system',
    price: 1299.99,
    categoryName: 'Exhaust',
    brand: 'Garrit Wulf',
    tags: ['exhaust', 'performance', 'racing']
  }
];

async function seedProductsWithSKU() {
  console.log('🌱 Starting to seed products with SKU...\n');

  try {
    // First, ensure categories exist
    const categories = new Map<string, string>();
    
    for (const product of sampleProducts) {
      if (!categories.has(product.categoryName)) {
        const category = await prisma.category.upsert({
          where: { name: product.categoryName },
          update: {},
          create: {
            name: product.categoryName,
            slug: product.categoryName.toLowerCase().replace(/\s+/g, '-'),
            description: `${product.categoryName} parts and accessories`,
          }
        });
        categories.set(product.categoryName, category.id);
        console.log(`✅ Category "${product.categoryName}" ready`);
      }
    }

    console.log('\n📦 Creating products...\n');

    // Create products
    for (const product of sampleProducts) {
      const categoryId = categories.get(product.categoryName)!;
      
      try {
        const created = await prisma.part.create({
          data: {
            name: product.name,
            slug: product.name.toLowerCase().replace(/\s+/g, '-'),
            partNumber: product.partNumber,
            sku: product.sku,
            description: product.description,
            shortDesc: product.shortDesc,
            price: product.price,
            categoryId,
            brand: product.brand,
            tags: product.tags,
            images: ['/images/placeholder-product.png'],
            compatibility: [],
            featured: false,
            published: true,
            publishedAt: new Date(),
          }
        });

        console.log(`✅ Created: ${created.name}`);
        console.log(`   Part #: ${created.partNumber}`);
        console.log(`   SKU: ${created.sku}`);
        console.log(`   Price: $${created.price}`);
        console.log('');
      } catch (error) {
        console.error(`❌ Failed to create "${product.name}":`, error instanceof Error ? error.message : 'Unknown error');
      }
    }

    console.log('✨ Seeding completed!\n');
    
    // Display summary
    const totalProducts = await prisma.part.count();
    const productsWithSKU = await prisma.part.count({ where: { sku: { not: "" } } });
    
    console.log('📊 Summary:');
    console.log(`   Total products: ${totalProducts}`);
    console.log(`   Products with SKU: ${productsWithSKU}`);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
seedProductsWithSKU()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });

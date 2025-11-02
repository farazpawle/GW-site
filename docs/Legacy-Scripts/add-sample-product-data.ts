import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎯 Adding sample data to multiple products...\n');

  // Get first 10 published products
  const products = await prisma.part.findMany({
    where: { published: true },
    take: 10,
  });

  if (products.length === 0) {
    console.log('❌ No published products found!');
    return;
  }

  console.log(`📦 Found ${products.length} products to update\n`);

  let updated = 0;

  for (const product of products) {
    console.log(`   Updating: ${product.name}...`);

  for (const product of products) {
    console.log(`   Updating: ${product.name}...`);

    // Update with all fields
    await prisma.part.update({
      where: { id: product.id },
      data: {
        // Add certifications
        certifications: [
          'ISO 9001:2015',
          'CE Certified',
          'RoHS Compliant',
          'OEM Approved',
        ],
        
        // Add warranty
        warranty: '24 months manufacturer warranty. Extended warranty available upon request. Covers defects in materials and workmanship under normal use.',
        
        // Add applications
        application: [
          'Heavy-duty trucks',
          'Construction equipment',
          'Industrial machinery',
          'Agricultural vehicles',
        ],
        
        // Add specifications
        specifications: {
          'Material': 'High-grade steel alloy',
          'Weight': '2.5 kg',
          'Dimensions': '350mm x 120mm x 80mm',
          'Temperature Range': '-40°C to +120°C',
          'Pressure Rating': '3000 PSI',
          'Thread Type': 'M16 x 1.5',
        },
        
        // Add compatibility
        compatibility: [
          'Mercedes-Benz Actros (2011-2023)',
          'Volvo FH Series (2012-2023)',
          'Scania R Series (2010-2023)',
          'MAN TGX (2007-2023)',
        ],
        
        // Add difficulty (rotate between options)
        difficulty: ['Easy', 'Moderate', 'Professional', 'Advanced'][updated % 4],
        
        // Add video URL
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        
        // Add brand if not exists
        brand: product.brand || 'Garrit & Wulf Premium',
        
        // Add origin if not exists
        origin: product.origin || 'Germany',
      },
    });

    updated++;
  }

  console.log(`\n✅ Updated ${updated} products successfully!\n`);
  console.log('📊 All products now have:');
  console.log('   - Certifications (4 items)');
  console.log('   - Warranty information');
  console.log('   - Applications (4 items)');
  console.log('   - Technical Specifications (6 specs)');
  console.log('   - Compatibility (4 vehicles)');
  console.log('   - Installation Difficulty');
  console.log('   - Video URL');
  console.log('   - Brand & Origin');
}
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

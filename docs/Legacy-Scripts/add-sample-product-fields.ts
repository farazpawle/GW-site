import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addSampleProductFields() {
  try {
    console.log('🔍 Fetching published products...\n');
    
    const products = await prisma.part.findMany({
      where: { published: true },
      take: 3, // Only update first 3 products
      select: { id: true, name: true, slug: true }
    });

    if (products.length === 0) {
      console.log('❌ No published products found');
      return;
    }

    // Product 1: Add Warranty + Application
    console.log(`📦 Product 1: ${products[0].name}`);
    await prisma.part.update({
      where: { id: products[0].id },
      data: {
        warranty: '2 years / 24,000 miles limited warranty',
        application: ['Passenger Cars', 'Light Trucks', 'SUVs']
      }
    });
    console.log('   ✅ Added: warranty + application\n');

    // Product 2: Add Specifications + Compatibility
    if (products[1]) {
      console.log(`📦 Product 2: ${products[1].name}`);
      await prisma.part.update({
        where: { id: products[1].id },
        data: {
          specifications: {
            material: 'Ceramic',
            friction_coefficient: '0.38-0.42',
            operating_temp: '-40°C to 650°C',
            noise_level: 'Low',
            wear_indicator: 'Yes'
          },
          compatibility: ['Honda Civic 2016-2021', 'Honda Accord 2018-2022', 'Acura ILX 2016-2020']
        }
      });
      console.log('   ✅ Added: specifications + compatibility\n');
    }

    // Product 3: Add Warranty + Specifications (different combination)
    if (products[2]) {
      console.log(`📦 Product 3: ${products[2].name}`);
      await prisma.part.update({
        where: { id: products[2].id },
        data: {
          warranty: 'Lifetime warranty against manufacturing defects',
          specifications: {
            type: 'Hydraulic',
            pressure_rating: '3000 PSI',
            thread_size: 'M10x1.0',
            length: '12 inches'
          }
        }
      });
      console.log('   ✅ Added: warranty + specifications\n');
    }

    console.log('✅ Sample data added successfully!');
    console.log('\n📋 Summary:');
    console.log(`   Product 1: Warranty ✓ | Application ✓`);
    console.log(`   Product 2: Specifications ✓ | Compatibility ✓`);
    console.log(`   Product 3: Warranty ✓ | Specifications ✓`);
    console.log('\n🌐 Test URLs:');
    products.forEach((p, i) => {
      console.log(`   ${i + 1}. http://localhost:3000/products/${p.slug}`);
    });

  } catch (error) {
    console.error('❌ Error adding sample data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addSampleProductFields();

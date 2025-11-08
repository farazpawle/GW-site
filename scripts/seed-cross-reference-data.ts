/**
 * Seed Dummy Cross-Reference Data
 * 
 * This script populates dummy data for Phase 13 features:
 * - Cross-references (alternative/supersedes/compatible)
 * - OEM part numbers
 * - Vehicle compatibility
 * 
 * Run: npx tsx scripts/seed-cross-reference-data.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Phase 13 dummy data seeding for ALL products...\n');

  // Get ALL published products
  const products = await prisma.part.findMany({
    where: {
      published: true,
    },
  });

  if (products.length === 0) {
    console.error('❌ No published products found. Please create a product first.');
    return;
  }

  console.log(`✅ Found ${products.length} published products`);
  console.log('   Will add dummy data to each product...\n');

  // Loop through each product
  for (const product of products) {
    console.log(`\n📦 Processing: ${product.name} (${product.partNumber})`);
    console.log('━'.repeat(60));

  // 1. Create Cross-References
  console.log('📦 Creating Cross-References...');
  
  const crossReferences = await Promise.all([
    // Alternative parts
    prisma.partCrossReference.create({
      data: {
        partId: product.id,
        referenceType: 'alternative',
        brandName: 'Bosch',
        partNumber: '0986AB1234',
        notes: 'Direct replacement, same specifications',
      },
    }),
    prisma.partCrossReference.create({
      data: {
        partId: product.id,
        referenceType: 'alternative',
        brandName: 'Denso',
        partNumber: 'DEN-5678-XYZ',
        notes: 'High-performance alternative',
      },
    }),
    prisma.partCrossReference.create({
      data: {
        partId: product.id,
        referenceType: 'alternative',
        brandName: 'NGK',
        partNumber: 'NGK-AB-9012',
        notes: 'Budget-friendly option',
      },
    }),
    
    // Superseding parts
    prisma.partCrossReference.create({
      data: {
        partId: product.id,
        referenceType: 'supersedes',
        brandName: 'OEM',
        partNumber: 'OLD-PART-001',
        notes: 'Supersedes previous generation part',
      },
    }),
    prisma.partCrossReference.create({
      data: {
        partId: product.id,
        referenceType: 'supersedes',
        brandName: 'OEM',
        partNumber: 'OLD-PART-002',
        notes: 'Updated design with improved durability',
      },
    }),
    
    // Compatible parts
    prisma.partCrossReference.create({
      data: {
        partId: product.id,
        referenceType: 'compatible',
        brandName: 'ACDelco',
        partNumber: 'AC-D1234-56',
        notes: 'Compatible with slight modifications',
      },
    }),
    prisma.partCrossReference.create({
      data: {
        partId: product.id,
        referenceType: 'compatible',
        brandName: 'Valeo',
        partNumber: 'VAL-789-XYZ',
        notes: 'May require additional bracket',
      },
    }),
  ]);

  console.log(`   ✅ Created ${crossReferences.length} cross-references`);
  console.log(`      - Alternative: 3`);
  console.log(`      - Supersedes: 2`);
  console.log(`      - Compatible: 2\n`);

  // 2. Create OEM Part Numbers
  console.log('🏷️  Creating OEM Part Numbers...');
  
  const oemNumbers = await Promise.all([
    prisma.oEMPartNumber.create({
      data: {
        partId: product.id,
        manufacturer: 'Toyota',
        oemPartNumber: '90919-02260',
        notes: 'Original Toyota part number',
      },
    }),
    prisma.oEMPartNumber.create({
      data: {
        partId: product.id,
        manufacturer: 'Lexus',
        oemPartNumber: '90919-02268',
        notes: 'Lexus equivalent part',
      },
    }),
    prisma.oEMPartNumber.create({
      data: {
        partId: product.id,
        manufacturer: 'Honda',
        oemPartNumber: '30520-R70-A01',
        notes: 'Honda cross-compatible',
      },
    }),
    prisma.oEMPartNumber.create({
      data: {
        partId: product.id,
        manufacturer: 'Nissan',
        oemPartNumber: '22401-ED000',
        notes: 'Nissan OEM specification',
      },
    }),
    prisma.oEMPartNumber.create({
      data: {
        partId: product.id,
        manufacturer: 'BMW',
        oemPartNumber: '12137594937',
        notes: 'BMW genuine part',
      },
    }),
    prisma.oEMPartNumber.create({
      data: {
        partId: product.id,
        manufacturer: 'Mercedes-Benz',
        oemPartNumber: 'A0041591503',
        notes: 'Mercedes original equipment',
      },
    }),
  ]);

  console.log(`   ✅ Created ${oemNumbers.length} OEM part numbers\n`);

  // 3. Create Vehicle Compatibility
  console.log('🚗 Creating Vehicle Compatibility...');
  
  const vehicleCompatibility = await Promise.all([
    // Toyota vehicles
    prisma.vehicleCompatibility.create({
      data: {
        partId: product.id,
        make: 'Toyota',
        model: 'Camry',
        yearStart: 2015,
        yearEnd: 2020,
        engine: '2.5L 4-Cylinder',
        trim: 'LE, SE, XLE',
        position: 'Front',
        notes: 'All trim levels compatible',
      },
    }),
    prisma.vehicleCompatibility.create({
      data: {
        partId: product.id,
        make: 'Toyota',
        model: 'Corolla',
        yearStart: 2014,
        yearEnd: 2019,
        engine: '1.8L 4-Cylinder',
        trim: 'L, LE, S, XLE',
        position: 'Front',
        notes: 'Standard fitment',
      },
    }),
    prisma.vehicleCompatibility.create({
      data: {
        partId: product.id,
        make: 'Toyota',
        model: 'RAV4',
        yearStart: 2016,
        yearEnd: 2021,
        engine: '2.5L 4-Cylinder',
        trim: 'LE, XLE, Limited',
        position: 'Front',
        notes: 'Includes hybrid models',
      },
    }),
    
    // Honda vehicles
    prisma.vehicleCompatibility.create({
      data: {
        partId: product.id,
        make: 'Honda',
        model: 'Accord',
        yearStart: 2018,
        yearEnd: 2023,
        engine: '1.5L Turbo',
        trim: 'LX, Sport, EX, EX-L',
        position: 'Front Left',
        notes: 'Turbo models only',
      },
    }),
    prisma.vehicleCompatibility.create({
      data: {
        partId: product.id,
        make: 'Honda',
        model: 'Civic',
        yearStart: 2016,
        yearEnd: 2021,
        engine: '2.0L 4-Cylinder',
        trim: 'LX, EX, Touring',
        position: 'Front',
        notes: 'Non-Si models',
      },
    }),
    prisma.vehicleCompatibility.create({
      data: {
        partId: product.id,
        make: 'Honda',
        model: 'CR-V',
        yearStart: 2017,
        yearEnd: 2022,
        engine: '1.5L Turbo',
        trim: 'LX, EX, EX-L, Touring',
        position: 'Front',
        notes: 'All AWD and 2WD models',
      },
    }),
    
    // Nissan vehicles
    prisma.vehicleCompatibility.create({
      data: {
        partId: product.id,
        make: 'Nissan',
        model: 'Altima',
        yearStart: 2013,
        yearEnd: 2018,
        engine: '2.5L 4-Cylinder',
        trim: 'S, SV, SL',
        position: 'Front',
        notes: 'Standard engine only',
      },
    }),
    prisma.vehicleCompatibility.create({
      data: {
        partId: product.id,
        make: 'Nissan',
        model: 'Rogue',
        yearStart: 2014,
        yearEnd: 2020,
        engine: '2.5L 4-Cylinder',
        trim: 'S, SV, SL',
        position: 'Front',
        notes: 'Includes Rogue Sport',
      },
    }),
    
    // Ford vehicles
    prisma.vehicleCompatibility.create({
      data: {
        partId: product.id,
        make: 'Ford',
        model: 'F-150',
        yearStart: 2015,
        yearEnd: 2020,
        engine: '3.5L EcoBoost V6',
        trim: 'XLT, Lariat, King Ranch',
        position: 'Front',
        notes: 'EcoBoost models only',
      },
    }),
    prisma.vehicleCompatibility.create({
      data: {
        partId: product.id,
        make: 'Ford',
        model: 'Mustang',
        yearStart: 2015,
        yearEnd: 2023,
        engine: '5.0L V8',
        trim: 'GT, GT Premium',
        position: 'Front',
        notes: 'V8 models only, not EcoBoost',
      },
    }),
    
    // Chevrolet vehicles
    prisma.vehicleCompatibility.create({
      data: {
        partId: product.id,
        make: 'Chevrolet',
        model: 'Silverado 1500',
        yearStart: 2014,
        yearEnd: 2019,
        engine: '5.3L V8',
        trim: 'WT, LT, LTZ',
        position: 'Front',
        notes: 'Standard bed only',
      },
    }),
    prisma.vehicleCompatibility.create({
      data: {
        partId: product.id,
        make: 'Chevrolet',
        model: 'Malibu',
        yearStart: 2016,
        yearEnd: 2021,
        engine: '1.5L Turbo',
        trim: 'L, LS, LT, Premier',
        position: 'Front',
        notes: 'All trim levels',
      },
    }),
    
    // BMW vehicles
    prisma.vehicleCompatibility.create({
      data: {
        partId: product.id,
        make: 'BMW',
        model: '3 Series',
        yearStart: 2012,
        yearEnd: 2018,
        engine: '2.0L Turbo',
        trim: '320i, 328i, 330i',
        position: 'Front',
        notes: 'F30 chassis only',
      },
    }),
    prisma.vehicleCompatibility.create({
      data: {
        partId: product.id,
        make: 'BMW',
        model: 'X5',
        yearStart: 2014,
        yearEnd: 2018,
        engine: '3.0L Turbo',
        trim: 'xDrive35i, xDrive50i',
        position: 'Front',
        notes: 'F15 chassis',
      },
    }),
    
    // Mercedes-Benz vehicles
    prisma.vehicleCompatibility.create({
      data: {
        partId: product.id,
        make: 'Mercedes-Benz',
        model: 'C-Class',
        yearStart: 2015,
        yearEnd: 2021,
        engine: '2.0L Turbo',
        trim: 'C300, C300 4MATIC',
        position: 'Front',
        notes: 'W205 chassis',
      },
    }),
    prisma.vehicleCompatibility.create({
      data: {
        partId: product.id,
        make: 'Mercedes-Benz',
        model: 'E-Class',
        yearStart: 2017,
        yearEnd: 2023,
        engine: '2.0L Turbo',
        trim: 'E300, E300 4MATIC',
        position: 'Front',
        notes: 'W213 chassis',
      },
    }),
  ]);

    console.log(`   ✅ Created ${vehicleCompatibility.length} vehicle compatibility records`);
    console.log(`      - Toyota: 3`);
    console.log(`      - Honda: 3`);
    console.log(`      - Nissan: 2`);
    console.log(`      - Ford: 2`);
    console.log(`      - Chevrolet: 2`);
    console.log(`      - BMW: 2`);
    console.log(`      - Mercedes-Benz: 2\n`);
  } // End of for loop

  // Summary
  console.log('\n═══════════════════════════════════════');
  console.log('✅ Phase 13 Dummy Data Seeding Complete!');
  console.log('═══════════════════════════════════════');
  console.log(`Total Products Updated: ${products.length}`);
  console.log('');
  console.log('Data Created per Product:');
  console.log(`  • Cross-References: 7`);
  console.log(`  • OEM Numbers: 6`);
  console.log(`  • Vehicle Compatibility: 16`);
  console.log('');
  console.log('🌐 View Products on Frontend:');
  products.forEach(p => {
    console.log(`   - ${p.name}: http://localhost:3000/products/${p.slug}`);
  });
  console.log('');
  console.log('🔧 Edit in Admin Panel:');
  console.log(`   http://localhost:3000/admin/parts`);
  console.log('═══════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

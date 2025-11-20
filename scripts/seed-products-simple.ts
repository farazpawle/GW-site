import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Simple product seeding script
 * Creates 15 realistic auto parts with proper schema compliance
 */

async function main() {
  console.log('🚀 Starting product seed process...\n');

  // Create or get default category
  console.log('📁 Setting up category...');
  const category = await prisma.category.upsert({
    where: { slug: 'auto-parts' },
    update: {},
    create: {
      name: 'Auto Parts',
      slug: 'auto-parts',
      description: 'Premium automotive parts and accessories',
    },
  });
  console.log('✅ Category ready:', category.name);

  // Product data
  const products = [
    {
      name: 'Premium Brake Pad Set',
      slug: 'premium-brake-pad-set',
      partNumber: 'BP-2024-001',
      sku: 'BRK-PAD-001',
      price: 89.99,
      comparePrice: 119.99,
      shortDesc: 'Ceramic brake pads with superior stopping power',
      description: 'High-performance ceramic brake pads designed for superior stopping power and reduced brake dust. Compatible with most modern vehicles.',
      brand: 'BrakeMaster',
      origin: 'Germany',
      warranty: '2 years / 50,000 km',
      tags: ['brakes', 'safety', 'premium'],
      application: ['Front Axle', 'Rear Axle'],
      certifications: ['ISO 9001', 'TUV Certified'],
      featured: true,
      published: true,
      inStock: true,
      stockQuantity: 45,
    },
    {
      name: 'Engine Oil Filter',
      slug: 'engine-oil-filter',
      partNumber: 'OF-2024-002',
      sku: 'ENG-FLT-002',
      price: 24.99,
      comparePrice: 34.99,
      shortDesc: 'Advanced filtration for engine protection',
      description: 'Premium oil filter with advanced filtration technology. Captures 99% of harmful contaminants to protect your engine.',
      brand: 'FilterPro',
      origin: 'USA',
      warranty: '1 year',
      tags: ['engine', 'maintenance', 'oil'],
      application: ['Engine'],
      certifications: ['ISO 9001'],
      featured: true,
      published: true,
      inStock: true,
      stockQuantity: 120,
    },
    {
      name: 'LED Headlight Bulbs H7',
      slug: 'led-headlight-bulbs-h7',
      partNumber: 'LH-2024-003',
      sku: 'LED-H7-003',
      price: 79.99,
      comparePrice: 99.99,
      shortDesc: 'Ultra-bright 6000K LED headlights',
      description: 'Ultra-bright LED headlight bulbs with 6000K color temperature. Easy plug-and-play installation with built-in cooling fan.',
      brand: 'LightTech',
      origin: 'Japan',
      warranty: '3 years',
      tags: ['lighting', 'LED', 'headlights'],
      application: ['Front Lighting'],
      certifications: ['CE Certified'],
      featured: true,
      published: true,
      inStock: true,
      stockQuantity: 60,
    },
    {
      name: 'Air Conditioning Compressor',
      slug: 'ac-compressor',
      partNumber: 'AC-2024-004',
      sku: 'AC-COMP-004',
      price: 349.99,
      comparePrice: 449.99,
      shortDesc: 'High-efficiency AC compressor',
      description: 'Heavy-duty AC compressor with improved cooling efficiency. Direct fit replacement for OEM units.',
      brand: 'CoolAir',
      origin: 'South Korea',
      warranty: '3 years / 100,000 km',
      tags: ['AC', 'cooling', 'climate'],
      application: ['Climate Control'],
      certifications: ['ISO 9001', 'QS 9000'],
      featured: false,
      published: true,
      inStock: true,
      stockQuantity: 15,
    },
    {
      name: 'Performance Spark Plugs Set',
      slug: 'performance-spark-plugs',
      partNumber: 'SP-2024-005',
      sku: 'SPK-PLG-005',
      price: 59.99,
      comparePrice: 79.99,
      shortDesc: 'Iridium spark plugs for better performance',
      description: 'Iridium-tipped spark plugs for improved ignition and fuel efficiency. Set of 4 plugs.',
      brand: 'IgnitePro',
      origin: 'Japan',
      warranty: '5 years / 100,000 km',
      tags: ['engine', 'ignition', 'performance'],
      application: ['Engine'],
      certifications: ['ISO 9001'],
      featured: false,
      published: true,
      inStock: true,
      stockQuantity: 80,
    },
    {
      name: 'Cabin Air Filter',
      slug: 'cabin-air-filter',
      partNumber: 'CF-2024-006',
      sku: 'CAB-FLT-006',
      price: 29.99,
      comparePrice: 39.99,
      shortDesc: 'Carbon-activated cabin filter',
      description: 'Activated carbon cabin filter that removes pollen, dust, and odors. Improves air quality inside your vehicle.',
      brand: 'AirPure',
      origin: 'Germany',
      warranty: '1 year',
      tags: ['filter', 'air quality', 'maintenance'],
      application: ['Interior'],
      certifications: ['ISO 9001'],
      featured: false,
      published: true,
      inStock: true,
      stockQuantity: 95,
    },
    {
      name: 'Heavy Duty Battery 12V 75Ah',
      slug: 'heavy-duty-battery-75ah',
      partNumber: 'BT-2024-007',
      sku: 'BAT-75A-007',
      price: 159.99,
      comparePrice: 199.99,
      shortDesc: 'Maintenance-free 75Ah battery',
      description: 'Maintenance-free battery with enhanced cold cranking amps. Perfect for extreme weather conditions.',
      brand: 'PowerCell',
      origin: 'USA',
      warranty: '3 years',
      tags: ['battery', 'electrical', 'power'],
      application: ['Electrical System'],
      certifications: ['ISO 9001', 'DIN Standard'],
      featured: true,
      published: true,
      inStock: true,
      stockQuantity: 25,
    },
    {
      name: 'Radiator Coolant 5L',
      slug: 'radiator-coolant-5l',
      partNumber: 'RC-2024-008',
      sku: 'CLT-5L-008',
      price: 34.99,
      comparePrice: 44.99,
      shortDesc: 'All-season radiator coolant',
      description: 'Long-life antifreeze coolant suitable for all seasons. Protects against freezing, overheating, and corrosion.',
      brand: 'CoolFlow',
      origin: 'Germany',
      warranty: 'N/A',
      tags: ['coolant', 'maintenance', 'fluids'],
      application: ['Cooling System'],
      certifications: ['ISO 9001'],
      featured: false,
      published: true,
      inStock: true,
      stockQuantity: 150,
    },
    {
      name: 'Windshield Wiper Blades Set',
      slug: 'windshield-wiper-blades',
      partNumber: 'WB-2024-009',
      sku: 'WPR-SET-009',
      price: 39.99,
      comparePrice: 54.99,
      shortDesc: 'All-weather wiper blades',
      description: 'All-weather wiper blades with aerodynamic design. Provides streak-free wiping in all conditions.',
      brand: 'ClearView',
      origin: 'France',
      warranty: '1 year',
      tags: ['wipers', 'visibility', 'safety'],
      application: ['Windshield'],
      certifications: ['ISO 9001'],
      featured: false,
      published: true,
      inStock: true,
      stockQuantity: 70,
    },
    {
      name: 'Shock Absorber Pair',
      slug: 'shock-absorber-pair',
      partNumber: 'SA-2024-010',
      sku: 'SHK-PAR-010',
      price: 189.99,
      comparePrice: 249.99,
      shortDesc: 'Gas-charged shock absorbers',
      description: 'Premium gas-charged shock absorbers for improved ride comfort and handling. Sold as a pair.',
      brand: 'RideComfort',
      origin: 'Belgium',
      warranty: '5 years / 80,000 km',
      tags: ['suspension', 'handling', 'comfort'],
      application: ['Front Suspension', 'Rear Suspension'],
      certifications: ['ISO 9001', 'TUV Certified'],
      featured: true,
      published: true,
      inStock: true,
      stockQuantity: 30,
    },
    {
      name: 'Fuel Pump Assembly',
      slug: 'fuel-pump-assembly',
      partNumber: 'FP-2024-011',
      sku: 'FUL-PMP-011',
      price: 279.99,
      comparePrice: 349.99,
      shortDesc: 'OEM-quality fuel pump',
      description: 'Electric fuel pump with integrated pressure regulator. Direct replacement for OEM specifications.',
      brand: 'FuelFlow',
      origin: 'USA',
      warranty: '2 years / 60,000 km',
      tags: ['fuel system', 'pump', 'engine'],
      application: ['Fuel System'],
      certifications: ['ISO 9001', 'QS 9000'],
      featured: false,
      published: false, // Unpublished for "Needs Attention" widget
      inStock: true,
      stockQuantity: 12,
    },
    {
      name: 'Timing Belt Kit',
      slug: 'timing-belt-kit',
      partNumber: 'TB-2024-012',
      sku: 'TMG-KIT-012',
      price: 149.99,
      comparePrice: 199.99,
      shortDesc: 'Complete timing belt kit',
      description: 'Complete timing belt kit including belt, tensioner, and idler pulleys. OEM-grade quality.',
      brand: 'TimePro',
      origin: 'Italy',
      warranty: '2 years / 100,000 km',
      tags: ['engine', 'timing', 'maintenance'],
      application: ['Engine'],
      certifications: ['ISO 9001'],
      featured: false,
      published: true,
      inStock: false, // Out of stock for "Needs Attention" widget
      stockQuantity: 0,
    },
    {
      name: 'Brake Rotor Pair',
      slug: 'brake-rotor-pair',
      partNumber: 'BR-2024-013',
      sku: 'BRK-ROT-013',
      price: 129.99,
      comparePrice: 169.99,
      shortDesc: 'Ventilated brake rotors',
      description: '', // Empty description for "Needs Attention" widget
      brand: 'BrakeMaster',
      origin: 'Germany',
      warranty: '2 years / 50,000 km',
      tags: ['brakes', 'rotors', 'safety'],
      application: ['Front Axle', 'Rear Axle'],
      certifications: ['ISO 9001', 'TUV Certified'],
      featured: false,
      published: true,
      inStock: true,
      stockQuantity: 40,
      images: [], // No images for "Needs Attention" widget
    },
    {
      name: 'Alternator 120A',
      slug: 'alternator-120a',
      partNumber: 'AL-2024-014',
      sku: 'ALT-120-014',
      price: 249.99,
      comparePrice: 319.99,
      shortDesc: '120A high-output alternator',
      description: 'High-output alternator with 120A capacity. Ensures reliable charging in all conditions.',
      brand: 'ChargePro',
      origin: 'USA',
      warranty: '3 years / 100,000 km',
      tags: ['electrical', 'charging', 'alternator'],
      application: ['Electrical System'],
      certifications: ['ISO 9001'],
      featured: false,
      published: true,
      inStock: true,
      stockQuantity: 18,
    },
    {
      name: 'All-Season Tire 205/55R16',
      slug: 'all-season-tire-205-55r16',
      partNumber: 'TR-2024-015',
      sku: 'TIR-205-015',
      price: 119.99,
      comparePrice: 159.99,
      shortDesc: 'Premium all-season tire',
      description: 'Premium all-season tire with excellent grip and long tread life. EU tire label: B/B/71dB.',
      brand: 'RoadGrip',
      origin: 'France',
      warranty: '4 years / 80,000 km',
      tags: ['tires', 'all-season', 'safety'],
      application: ['Wheels'],
      certifications: ['EU Tire Label', 'ISO 9001'],
      featured: true,
      published: true,
      inStock: true,
      stockQuantity: 50,
    },
  ];

  console.log(`\n🔧 Creating ${products.length} products...`);
  let created = 0;
  let skipped = 0;

  for (const product of products) {
    try {
      // Check if product already exists
      const existing = await prisma.part.findFirst({
        where: {
          OR: [
            { partNumber: product.partNumber },
            { sku: product.sku },
            { slug: product.slug },
          ],
        },
      });

      if (existing) {
        console.log(`⏭️  Skipped: ${product.name} (already exists)`);
        skipped++;
        continue;
      }

      await prisma.part.create({
        data: {
          ...product,
          categoryId: category.id,
          publishedAt: product.published ? new Date() : null,
        },
      });

      created++;
      console.log(`✅ Created: ${product.name}`);
    } catch (error) {
      console.error(`❌ Failed to create "${product.name}":`, error);
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   ✅ Created: ${created}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   📦 Total: ${products.length}`);
  console.log('\n🎉 Product seeding complete!');
}

main()
  .catch((error) => {
    console.error('❌ Error during seed process:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

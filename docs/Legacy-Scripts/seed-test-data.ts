/**
 * Seed script for creating test data with collections and diverse products
 * Includes: 5 collections, 20 products with varied brands, tags, origins, categories
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sample data arrays
const brands = ['ACDelco', 'Bosch', 'Denso', 'NGK', 'Monroe', 'Moog', 'Raybestos', 'Wagner'];
const origins = ['USA', 'Germany', 'Japan', 'China', 'Mexico', 'South Korea'];
const tags = [
  'Performance',
  'Heavy-Duty',
  'OEM-Quality',
  'Budget-Friendly',
  'Premium',
  'Racing',
  'Street',
  'Off-Road',
];

async function main() {
  console.log('🌱 Starting seed process...\n');

  // Step 1: Get or create categories
  console.log('📂 Ensuring categories exist...');
  const categoryData = [
    { name: 'Engine Parts', slug: 'engine-parts', description: 'Internal engine components' },
    { name: 'Brake System', slug: 'brake-system', description: 'Brake components and accessories' },
    { name: 'Suspension', slug: 'suspension', description: 'Suspension and steering parts' },
    { name: 'Electrical', slug: 'electrical', description: 'Electrical components and sensors' },
    { name: 'Exhaust', slug: 'exhaust', description: 'Exhaust system components' },
  ];

  const categories = [];
  for (const cat of categoryData) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categories.push(category);
    console.log(`   ✓ ${category.name}`);
  }

  // Step 2: Create collections
  console.log('\n📦 Creating collections...');
  const collections = [];
  const collectionData = [
    {
      name: 'Best Sellers',
      slug: 'best-sellers',
      description: 'Our most popular auto parts',
      published: true,
      publishedAt: new Date(),
    },
    {
      name: 'Performance Parts',
      slug: 'performance-parts',
      description: 'High-performance upgrades for your vehicle',
      published: true,
      publishedAt: new Date(),
    },
    {
      name: 'Budget Picks',
      slug: 'budget-picks',
      description: 'Quality parts at affordable prices',
      published: true,
      publishedAt: new Date(),
    },
    {
      name: 'Premium Selection',
      slug: 'premium-selection',
      description: 'Top-tier components for discerning customers',
      published: true,
      publishedAt: new Date(),
    },
    {
      name: 'New Arrivals',
      slug: 'new-arrivals',
      description: 'Recently added products',
      published: true,
      publishedAt: new Date(),
    },
  ];

  for (const coll of collectionData) {
    const collection = await prisma.collection.upsert({
      where: { slug: coll.slug },
      update: {},
      create: coll,
    });
    collections.push(collection);
    console.log(`   ✓ ${collection.name}`);
  }

  // Step 3: Create 20 diverse products
  console.log('\n🔧 Creating 20 test products...\n');
  const products = [
    {
      name: 'High-Performance Spark Plug Set',
      slug: 'high-performance-spark-plug-set',
      shortDesc: 'Premium iridium spark plugs for enhanced ignition',
      description: 'Advanced iridium-tipped spark plugs designed for maximum performance and longevity. Features ultra-fine electrode design for improved combustion efficiency.',
      partNumber: 'SP-IRD-001',
      sku: 'SKU-SP-001',
      price: 89.99,
      compareAtPrice: 119.99,
      brand: 'NGK',
      origin: 'Japan',
      tags: ['Performance', 'Premium', 'Racing'],
      categoryId: categories[0].id, // Engine Parts
      featured: true,
      published: true,
      publishedAt: new Date(),
      inStock: true,
      stockQuantity: 50,
      images: ['/images/products/spark-plug-1.jpg'],
    },
    {
      name: 'Ceramic Brake Pad Set - Front',
      slug: 'ceramic-brake-pad-set-front',
      shortDesc: 'Low-dust ceramic brake pads',
      description: 'Premium ceramic brake pads with superior stopping power and minimal dust. Quiet operation and extended rotor life.',
      partNumber: 'BP-CER-002',
      sku: 'SKU-BP-002',
      price: 64.99,
      compareAtPrice: 89.99,
      brand: 'Raybestos',
      origin: 'USA',
      tags: ['Premium', 'OEM-Quality'],
      categoryId: categories[1].id, // Brake System
      featured: true,
      published: true,
      publishedAt: new Date(),
      inStock: true,
      stockQuantity: 75,
      images: ['/images/products/brake-pad-1.jpg'],
    },
    {
      name: 'Heavy-Duty Shock Absorber',
      slug: 'heavy-duty-shock-absorber',
      shortDesc: 'Gas-charged performance shock',
      description: 'High-pressure gas-charged shock absorber for improved handling and ride quality. Monotube design for consistent performance.',
      partNumber: 'SH-MON-003',
      sku: 'SKU-SH-003',
      price: 129.99,
      compareAtPrice: 169.99,
      brand: 'Monroe',
      origin: 'USA',
      tags: ['Heavy-Duty', 'Performance', 'Off-Road'],
      categoryId: categories[2].id, // Suspension
      featured: false,
      published: true,
      publishedAt: new Date(),
      inStock: true,
      stockQuantity: 30,
      images: ['/images/products/shock-1.jpg'],
    },
    {
      name: 'Oxygen Sensor - Universal',
      slug: 'oxygen-sensor-universal',
      shortDesc: 'OEM-quality O2 sensor',
      description: 'Direct-fit oxygen sensor with OEM specifications. Ensures accurate air-fuel mixture monitoring for optimal engine performance.',
      partNumber: 'OS-UNV-004',
      sku: 'SKU-OS-004',
      price: 45.99,
      compareAtPrice: 65.99,
      brand: 'Bosch',
      origin: 'Germany',
      tags: ['OEM-Quality', 'Street'],
      categoryId: categories[3].id, // Electrical
      featured: false,
      published: true,
      publishedAt: new Date(),
      inStock: true,
      stockQuantity: 100,
      images: ['/images/products/o2-sensor-1.jpg'],
    },
    {
      name: 'Stainless Steel Muffler',
      slug: 'stainless-steel-muffler',
      shortDesc: 'Aluminized steel construction',
      description: 'Durable stainless steel muffler with corrosion-resistant finish. Deep tone and improved flow.',
      partNumber: 'MF-SS-005',
      sku: 'SKU-MF-005',
      price: 179.99,
      compareAtPrice: 229.99,
      brand: 'Walker',
      origin: 'USA',
      tags: ['Premium', 'Performance'],
      categoryId: categories[4].id, // Exhaust
      featured: false,
      published: true,
      publishedAt: new Date(),
      inStock: true,
      stockQuantity: 20,
      images: ['/images/products/muffler-1.jpg'],
    },
    {
      name: 'Budget Oil Filter',
      slug: 'budget-oil-filter',
      shortDesc: 'Standard spin-on oil filter',
      description: 'Reliable oil filter with anti-drainback valve. Standard efficiency filtration for regular oil changes.',
      partNumber: 'OF-STD-006',
      sku: 'SKU-OF-006',
      price: 8.99,
      compareAtPrice: 12.99,
      brand: 'ACDelco',
      origin: 'Mexico',
      tags: ['Budget-Friendly', 'Street'],
      categoryId: categories[0].id, // Engine Parts
      featured: false,
      published: true,
      publishedAt: new Date(),
      inStock: true,
      stockQuantity: 200,
      images: ['/images/products/oil-filter-1.jpg'],
    },
    {
      name: 'Performance Brake Rotor Set',
      slug: 'performance-brake-rotor-set',
      shortDesc: 'Cross-drilled and slotted rotors',
      description: 'High-performance brake rotors with cross-drilled and slotted design. Enhanced heat dissipation and pad bite.',
      partNumber: 'BR-XDS-007',
      sku: 'SKU-BR-007',
      price: 189.99,
      compareAtPrice: 249.99,
      brand: 'Wagner',
      origin: 'USA',
      tags: ['Performance', 'Racing', 'Premium'],
      categoryId: categories[1].id, // Brake System
      featured: true,
      published: true,
      publishedAt: new Date(),
      inStock: true,
      stockQuantity: 40,
      images: ['/images/products/brake-rotor-1.jpg'],
    },
    {
      name: 'Ball Joint Assembly',
      slug: 'ball-joint-assembly',
      shortDesc: 'Greaseable ball joint',
      description: 'Heavy-duty ball joint with grease fitting for extended service life. Forged steel construction.',
      partNumber: 'BJ-GRS-008',
      sku: 'SKU-BJ-008',
      price: 34.99,
      compareAtPrice: 49.99,
      brand: 'Moog',
      origin: 'USA',
      tags: ['Heavy-Duty', 'OEM-Quality'],
      categoryId: categories[2].id, // Suspension
      featured: false,
      published: true,
      publishedAt: new Date(),
      inStock: true,
      stockQuantity: 60,
      images: ['/images/products/ball-joint-1.jpg'],
    },
    {
      name: 'Alternator - 120 Amp',
      slug: 'alternator-120-amp',
      shortDesc: 'High-output alternator',
      description: 'Remanufactured alternator with 120-amp output. Includes voltage regulator and bearings.',
      partNumber: 'AL-120-009',
      sku: 'SKU-AL-009',
      price: 159.99,
      compareAtPrice: 199.99,
      brand: 'Bosch',
      origin: 'Germany',
      tags: ['OEM-Quality', 'Premium'],
      categoryId: categories[3].id, // Electrical
      featured: false,
      published: true,
      publishedAt: new Date(),
      inStock: true,
      stockQuantity: 25,
      images: ['/images/products/alternator-1.jpg'],
    },
    {
      name: 'Catalytic Converter',
      slug: 'catalytic-converter',
      shortDesc: 'EPA-compliant cat converter',
      description: 'Direct-fit catalytic converter with EPA certification. Stainless steel construction for durability.',
      partNumber: 'CC-EPA-010',
      sku: 'SKU-CC-010',
      price: 299.99,
      compareAtPrice: 399.99,
      brand: 'Walker',
      origin: 'USA',
      tags: ['OEM-Quality', 'Street'],
      categoryId: categories[4].id, // Exhaust
      featured: false,
      published: true,
      publishedAt: new Date(),
      inStock: true,
      stockQuantity: 15,
      images: ['/images/products/cat-converter-1.jpg'],
    },
    {
      name: 'Timing Belt Kit',
      slug: 'timing-belt-kit',
      shortDesc: 'Complete timing belt replacement kit',
      description: 'Comprehensive timing belt kit with belt, tensioner, and idler pulleys. Everything needed for a complete replacement.',
      partNumber: 'TB-KIT-011',
      sku: 'SKU-TB-011',
      price: 149.99,
      compareAtPrice: 199.99,
      brand: 'Denso',
      origin: 'Japan',
      tags: ['OEM-Quality', 'Premium'],
      categoryId: categories[0].id, // Engine Parts
      featured: true,
      published: true,
      publishedAt: new Date(),
      inStock: true,
      stockQuantity: 35,
      images: ['/images/products/timing-belt-1.jpg'],
    },
    {
      name: 'Economy Brake Drums - Rear',
      slug: 'economy-brake-drums-rear',
      shortDesc: 'Standard replacement brake drums',
      description: 'Cast iron brake drums with precision machined surface. Budget-friendly option for standard applications.',
      partNumber: 'BD-ECO-012',
      sku: 'SKU-BD-012',
      price: 79.99,
      compareAtPrice: 109.99,
      brand: 'ACDelco',
      origin: 'China',
      tags: ['Budget-Friendly', 'Street'],
      categoryId: categories[1].id, // Brake System
      featured: false,
      published: true,
      publishedAt: new Date(),
      inStock: true,
      stockQuantity: 45,
      images: ['/images/products/brake-drum-1.jpg'],
    },
    {
      name: 'Coilover Suspension Kit',
      slug: 'coilover-suspension-kit',
      shortDesc: 'Adjustable coilover system',
      description: 'Premium coilover suspension with adjustable damping and ride height. Track-proven performance.',
      partNumber: 'CO-ADJ-013',
      sku: 'SKU-CO-013',
      price: 1299.99,
      compareAtPrice: 1599.99,
      brand: 'KW',
      origin: 'Germany',
      tags: ['Performance', 'Racing', 'Premium'],
      categoryId: categories[2].id, // Suspension
      featured: true,
      published: true,
      publishedAt: new Date(),
      inStock: true,
      stockQuantity: 10,
      images: ['/images/products/coilover-1.jpg'],
    },
    {
      name: 'Fuel Pump Assembly',
      slug: 'fuel-pump-assembly',
      shortDesc: 'Complete in-tank fuel pump',
      description: 'Electric fuel pump assembly with strainer and level sender. Direct replacement for OEM unit.',
      partNumber: 'FP-ASM-014',
      sku: 'SKU-FP-014',
      price: 189.99,
      compareAtPrice: 249.99,
      brand: 'Bosch',
      origin: 'Germany',
      tags: ['OEM-Quality', 'Premium'],
      categoryId: categories[3].id, // Electrical
      featured: false,
      published: true,
      publishedAt: new Date(),
      inStock: true,
      stockQuantity: 30,
      images: ['/images/products/fuel-pump-1.jpg'],
    },
    {
      name: 'Performance Exhaust Header',
      slug: 'performance-exhaust-header',
      shortDesc: 'Stainless steel headers',
      description: 'Mandrel-bent stainless steel headers for improved exhaust flow. Significant power gains.',
      partNumber: 'EH-SS-015',
      sku: 'SKU-EH-015',
      price: 449.99,
      compareAtPrice: 599.99,
      brand: 'Borla',
      origin: 'USA',
      tags: ['Performance', 'Racing', 'Premium'],
      categoryId: categories[4].id, // Exhaust
      featured: true,
      published: true,
      publishedAt: new Date(),
      inStock: true,
      stockQuantity: 12,
      images: ['/images/products/header-1.jpg'],
    },
    {
      name: 'Water Pump with Gasket',
      slug: 'water-pump-with-gasket',
      shortDesc: 'Centrifugal water pump',
      description: 'High-quality water pump with new bearings and seals. Includes mounting gasket.',
      partNumber: 'WP-CEN-016',
      sku: 'SKU-WP-016',
      price: 69.99,
      compareAtPrice: 94.99,
      brand: 'ACDelco',
      origin: 'Mexico',
      tags: ['OEM-Quality', 'Street'],
      categoryId: categories[0].id, // Engine Parts
      featured: false,
      published: true,
      publishedAt: new Date(),
      inStock: true,
      stockQuantity: 55,
      images: ['/images/products/water-pump-1.jpg'],
    },
    {
      name: 'Hydraulic Brake Hose Set',
      slug: 'hydraulic-brake-hose-set',
      shortDesc: 'DOT-approved brake lines',
      description: 'Flexible hydraulic brake hoses with DOT FMVSS 106 certification. Includes fittings and clips.',
      partNumber: 'BH-HYD-017',
      sku: 'SKU-BH-017',
      price: 39.99,
      compareAtPrice: 54.99,
      brand: 'Raybestos',
      origin: 'USA',
      tags: ['OEM-Quality', 'Street'],
      categoryId: categories[1].id, // Brake System
      featured: false,
      published: true,
      publishedAt: new Date(),
      inStock: true,
      stockQuantity: 70,
      images: ['/images/products/brake-hose-1.jpg'],
    },
    {
      name: 'Sway Bar End Link Kit',
      slug: 'sway-bar-end-link-kit',
      shortDesc: 'Front stabilizer links',
      description: 'Heavy-duty sway bar end links with greaseable ball joints. Reduces body roll.',
      partNumber: 'SB-END-018',
      sku: 'SKU-SB-018',
      price: 29.99,
      compareAtPrice: 44.99,
      brand: 'Moog',
      origin: 'USA',
      tags: ['Heavy-Duty', 'Budget-Friendly'],
      categoryId: categories[2].id, // Suspension
      featured: false,
      published: true,
      publishedAt: new Date(),
      inStock: true,
      stockQuantity: 80,
      images: ['/images/products/sway-bar-link-1.jpg'],
    },
    {
      name: 'Mass Air Flow Sensor',
      slug: 'mass-air-flow-sensor',
      shortDesc: 'Hot-wire MAF sensor',
      description: 'Precision mass air flow sensor for accurate engine management. Direct OEM replacement.',
      partNumber: 'MAF-HW-019',
      sku: 'SKU-MAF-019',
      price: 119.99,
      compareAtPrice: 159.99,
      brand: 'Denso',
      origin: 'Japan',
      tags: ['OEM-Quality', 'Premium'],
      categoryId: categories[3].id, // Electrical
      featured: false,
      published: true,
      publishedAt: new Date(),
      inStock: true,
      stockQuantity: 40,
      images: ['/images/products/maf-sensor-1.jpg'],
    },
    {
      name: 'Exhaust Flex Pipe',
      slug: 'exhaust-flex-pipe',
      shortDesc: 'Universal flex coupling',
      description: 'Stainless steel exhaust flex pipe for vibration absorption. Universal fit with various diameters.',
      partNumber: 'FX-UNV-020',
      sku: 'SKU-FX-020',
      price: 34.99,
      compareAtPrice: 49.99,
      brand: 'Walker',
      origin: 'China',
      tags: ['Budget-Friendly', 'Street'],
      categoryId: categories[4].id, // Exhaust
      featured: false,
      published: true,
      publishedAt: new Date(),
      inStock: true,
      stockQuantity: 90,
      images: ['/images/products/flex-pipe-1.jpg'],
    },
  ];

  const createdProducts = [];
  for (let i = 0; i < products.length; i++) {
    const product = await prisma.part.create({
      data: products[i],
    });
    createdProducts.push(product);
    console.log(`   ✓ [${i + 1}/20] ${product.name} (${product.brand})`);
  }

  // Step 4: Assign products to collections
  console.log('\n🔗 Assigning products to collections...');

  // Best Sellers - Products with featured flag
  const featuredProducts = createdProducts.filter((p) => p.featured);
  for (let i = 0; i < featuredProducts.length; i++) {
    await prisma.collectionProduct.create({
      data: {
        collectionId: collections[0].id, // Best Sellers
        partId: featuredProducts[i].id,
        position: i,
      },
    });
  }
  console.log(`   ✓ Best Sellers: ${featuredProducts.length} products`);

  // Performance Parts - Products with Performance tag
  const perfProducts = createdProducts.filter((p) => p.tags.includes('Performance'));
  for (let i = 0; i < perfProducts.length; i++) {
    await prisma.collectionProduct.create({
      data: {
        collectionId: collections[1].id, // Performance Parts
        partId: perfProducts[i].id,
        position: i,
      },
    });
  }
  console.log(`   ✓ Performance Parts: ${perfProducts.length} products`);

  // Budget Picks - Products with Budget-Friendly tag
  const budgetProducts = createdProducts.filter((p) => p.tags.includes('Budget-Friendly'));
  for (let i = 0; i < budgetProducts.length; i++) {
    await prisma.collectionProduct.create({
      data: {
        collectionId: collections[2].id, // Budget Picks
        partId: budgetProducts[i].id,
        position: i,
      },
    });
  }
  console.log(`   ✓ Budget Picks: ${budgetProducts.length} products`);

  // Premium Selection - Products with Premium tag
  const premiumProducts = createdProducts.filter((p) => p.tags.includes('Premium'));
  for (let i = 0; i < premiumProducts.length; i++) {
    await prisma.collectionProduct.create({
      data: {
        collectionId: collections[3].id, // Premium Selection
        partId: premiumProducts[i].id,
        position: i,
      },
    });
  }
  console.log(`   ✓ Premium Selection: ${premiumProducts.length} products`);

  // New Arrivals - Last 8 products
  const newProducts = createdProducts.slice(-8);
  for (let i = 0; i < newProducts.length; i++) {
    await prisma.collectionProduct.create({
      data: {
        collectionId: collections[4].id, // New Arrivals
        partId: newProducts[i].id,
        position: i,
      },
    });
  }
  console.log(`   ✓ New Arrivals: ${newProducts.length} products`);

  // Summary
  console.log('\n✅ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   • Categories: ${categories.length}`);
  console.log(`   • Collections: ${collections.length}`);
  console.log(`   • Products: ${createdProducts.length}`);
  console.log('\n🏷️  Brands used:', [...new Set(createdProducts.map((p) => p.brand))].join(', '));
  console.log('🌍 Origins used:', [...new Set(createdProducts.map((p) => p.origin))].join(', '));
  console.log(
    '🔖 Tags used:',
    [...new Set(createdProducts.flatMap((p) => p.tags))].sort().join(', ')
  );
  console.log('\n✨ You can now test the filtering functionality with diverse data!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

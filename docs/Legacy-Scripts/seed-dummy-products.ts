import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const dummyProducts = [
  {
    name: "Premium Brake Pad Set",
    slug: "premium-brake-pad-set",
    partNumber: "BP-2024-001",
    description: "High-performance ceramic brake pads designed for superior stopping power and reduced brake dust. Compatible with most modern vehicles.",
    shortDesc: "Ceramic brake pads with superior stopping power",
    price: 89.99,
    comparePrice: 119.99,
    brand: "BrakeMaster",
    origin: "Germany",
    tags: ["brakes", "safety", "premium"],
    difficulty: "Moderate",
    application: ["Front Axle", "Rear Axle"],
    certifications: ["ISO 9001", "TUV Certified"],
    warranty: "2 years / 50,000 km",
    featured: true,
    published: true,
    images: ["/images/products/brake-pad.jpg"],
  },
  {
    name: "Engine Oil Filter",
    slug: "engine-oil-filter",
    partNumber: "OF-2024-002",
    description: "Premium oil filter with advanced filtration technology. Captures 99% of harmful contaminants to protect your engine.",
    shortDesc: "Advanced filtration for engine protection",
    price: 24.99,
    comparePrice: 34.99,
    brand: "FilterPro",
    origin: "USA",
    tags: ["engine", "maintenance", "oil"],
    difficulty: "Easy",
    application: ["Engine"],
    certifications: ["ISO 9001"],
    warranty: "1 year",
    featured: true,
    published: true,
    images: ["/images/products/oil-filter.jpg"],
  },
  {
    name: "LED Headlight Bulbs H7",
    slug: "led-headlight-bulbs-h7",
    partNumber: "LH-2024-003",
    description: "Ultra-bright LED headlight bulbs with 6000K color temperature. Easy plug-and-play installation with built-in cooling fan.",
    shortDesc: "Ultra-bright 6000K LED headlights",
    price: 79.99,
    comparePrice: 99.99,
    brand: "LightTech",
    origin: "Japan",
    tags: ["lighting", "LED", "headlights"],
    difficulty: "Easy",
    application: ["Front Lighting"],
    certifications: ["CE Certified"],
    warranty: "3 years",
    featured: true,
    published: true,
    images: ["/images/products/led-bulb.jpg"],
  },
  {
    name: "Air Conditioning Compressor",
    slug: "ac-compressor",
    partNumber: "AC-2024-004",
    description: "Heavy-duty AC compressor with improved cooling efficiency. Direct fit replacement for OEM units.",
    shortDesc: "High-efficiency AC compressor",
    price: 349.99,
    comparePrice: 449.99,
    brand: "CoolAir",
    origin: "South Korea",
    tags: ["AC", "cooling", "climate"],
    difficulty: "Professional",
    application: ["Climate Control"],
    certifications: ["ISO 9001", "QS 9000"],
    warranty: "3 years / 100,000 km",
    featured: false,
    published: true,
    images: ["/images/products/ac-compressor.jpg"],
  },
  {
    name: "Performance Spark Plugs Set",
    slug: "performance-spark-plugs",
    partNumber: "SP-2024-005",
    description: "Iridium-tipped spark plugs for improved ignition and fuel efficiency. Set of 4 plugs.",
    shortDesc: "Iridium spark plugs for better performance",
    price: 59.99,
    comparePrice: 79.99,
    brand: "IgnitePro",
    origin: "Japan",
    tags: ["engine", "ignition", "performance"],
    difficulty: "Moderate",
    application: ["Engine"],
    certifications: ["ISO 9001"],
    warranty: "5 years / 100,000 km",
    featured: false,
    published: true,
    images: ["/images/products/spark-plugs.jpg"],
  },
  {
    name: "Cabin Air Filter",
    slug: "cabin-air-filter",
    partNumber: "CF-2024-006",
    description: "Activated carbon cabin filter that removes pollen, dust, and odors. Improves air quality inside your vehicle.",
    shortDesc: "Carbon-activated cabin filter",
    price: 29.99,
    comparePrice: 39.99,
    brand: "AirPure",
    origin: "Germany",
    tags: ["filter", "air quality", "maintenance"],
    difficulty: "Easy",
    application: ["Interior"],
    certifications: ["ISO 9001"],
    warranty: "1 year",
    featured: false,
    published: true,
    images: ["/images/products/cabin-filter.jpg"],
  },
  {
    name: "Heavy Duty Battery 12V 75Ah",
    slug: "heavy-duty-battery-75ah",
    partNumber: "BT-2024-007",
    description: "Maintenance-free battery with enhanced cold cranking amps. Perfect for extreme weather conditions.",
    shortDesc: "Maintenance-free 75Ah battery",
    price: 159.99,
    comparePrice: 199.99,
    brand: "PowerCell",
    origin: "USA",
    tags: ["battery", "electrical", "power"],
    difficulty: "Moderate",
    application: ["Electrical System"],
    certifications: ["ISO 9001", "DIN Standard"],
    warranty: "3 years",
    featured: true,
    published: true,
    images: ["/images/products/battery.jpg"],
  },
  {
    name: "Radiator Coolant 5L",
    slug: "radiator-coolant-5l",
    partNumber: "RC-2024-008",
    description: "Long-life antifreeze coolant suitable for all seasons. Protects against freezing, overheating, and corrosion.",
    shortDesc: "All-season radiator coolant",
    price: 34.99,
    comparePrice: 44.99,
    brand: "CoolFlow",
    origin: "Germany",
    tags: ["coolant", "maintenance", "fluids"],
    difficulty: "Easy",
    application: ["Cooling System"],
    certifications: ["ISO 9001"],
    warranty: "N/A",
    featured: false,
    published: true,
    images: ["/images/products/coolant.jpg"],
  },
  {
    name: "Windshield Wiper Blades Set",
    slug: "windshield-wiper-blades",
    partNumber: "WB-2024-009",
    description: "All-weather wiper blades with aerodynamic design. Provides streak-free wiping in all conditions.",
    shortDesc: "All-weather wiper blades",
    price: 39.99,
    comparePrice: 54.99,
    brand: "ClearView",
    origin: "France",
    tags: ["wipers", "visibility", "safety"],
    difficulty: "Easy",
    application: ["Windshield"],
    certifications: ["ISO 9001"],
    warranty: "1 year",
    featured: false,
    published: true,
    images: ["/images/products/wiper-blades.jpg"],
  },
  {
    name: "Shock Absorber Pair",
    slug: "shock-absorber-pair",
    partNumber: "SA-2024-010",
    description: "Premium gas-charged shock absorbers for improved ride comfort and handling. Sold as a pair.",
    shortDesc: "Gas-charged shock absorbers",
    price: 189.99,
    comparePrice: 249.99,
    brand: "RideComfort",
    origin: "Belgium",
    tags: ["suspension", "handling", "comfort"],
    difficulty: "Professional",
    application: ["Front Suspension", "Rear Suspension"],
    certifications: ["ISO 9001", "TUV Certified"],
    warranty: "5 years / 80,000 km",
    featured: true,
    published: true,
    images: ["/images/products/shock-absorber.jpg"],
  },
  {
    name: "Fuel Pump Assembly",
    slug: "fuel-pump-assembly",
    partNumber: "FP-2024-011",
    description: "Electric fuel pump with integrated pressure regulator. Direct replacement for OEM specifications.",
    shortDesc: "OEM-quality fuel pump",
    price: 279.99,
    comparePrice: 349.99,
    brand: "FuelFlow",
    origin: "USA",
    tags: ["fuel system", "pump", "engine"],
    difficulty: "Advanced",
    application: ["Fuel System"],
    certifications: ["ISO 9001", "QS 9000"],
    warranty: "2 years / 60,000 km",
    featured: false,
    published: true,
    images: ["/images/products/fuel-pump.jpg"],
  },
  {
    name: "Timing Belt Kit",
    slug: "timing-belt-kit",
    partNumber: "TB-2024-012",
    description: "Complete timing belt kit including belt, tensioner, and idler pulleys. OEM-grade quality.",
    shortDesc: "Complete timing belt kit",
    price: 149.99,
    comparePrice: 199.99,
    brand: "TimePro",
    origin: "Italy",
    tags: ["engine", "timing", "maintenance"],
    difficulty: "Professional",
    application: ["Engine"],
    certifications: ["ISO 9001"],
    warranty: "2 years / 100,000 km",
    featured: false,
    published: true,
    images: ["/images/products/timing-belt.jpg"],
  },
  {
    name: "Brake Rotor Pair",
    slug: "brake-rotor-pair",
    partNumber: "BR-2024-013",
    description: "Ventilated brake rotors with anti-rust coating. Provides consistent braking performance.",
    shortDesc: "Ventilated brake rotors",
    price: 129.99,
    comparePrice: 169.99,
    brand: "BrakeMaster",
    origin: "Germany",
    tags: ["brakes", "rotors", "safety"],
    difficulty: "Moderate",
    application: ["Front Axle", "Rear Axle"],
    certifications: ["ISO 9001", "TUV Certified"],
    warranty: "2 years / 50,000 km",
    featured: false,
    published: true,
    images: ["/images/products/brake-rotor.jpg"],
  },
  {
    name: "Alternator 120A",
    slug: "alternator-120a",
    partNumber: "AL-2024-014",
    description: "High-output alternator with 120A capacity. Ensures reliable charging in all conditions.",
    shortDesc: "120A high-output alternator",
    price: 249.99,
    comparePrice: 319.99,
    brand: "ChargePro",
    origin: "USA",
    tags: ["electrical", "charging", "alternator"],
    difficulty: "Professional",
    application: ["Electrical System"],
    certifications: ["ISO 9001"],
    warranty: "3 years / 100,000 km",
    featured: false,
    published: true,
    images: ["/images/products/alternator.jpg"],
  },
  {
    name: "All-Season Tire 205/55R16",
    slug: "all-season-tire-205-55r16",
    partNumber: "TR-2024-015",
    description: "Premium all-season tire with excellent grip and long tread life. EU tire label: B/B/71dB.",
    shortDesc: "Premium all-season tire",
    price: 119.99,
    comparePrice: 159.99,
    brand: "RoadGrip",
    origin: "France",
    tags: ["tires", "all-season", "safety"],
    difficulty: "Professional",
    application: ["Wheels"],
    certifications: ["EU Tire Label", "ISO 9001"],
    warranty: "4 years / 80,000 km",
    featured: true,
    published: true,
    images: ["/images/products/tire.jpg"],
  },
];

async function seedProducts() {
  try {
    console.log('🌱 Starting to seed dummy products...\n');

    // First, get or create a default category
    let category = await prisma.category.findFirst({
      where: { slug: 'general-parts' }
    });

    if (!category) {
      console.log('📁 Creating default category...');
      category = await prisma.category.create({
        data: {
          name: 'General Parts',
          slug: 'general-parts',
          description: 'General automotive parts and accessories',
        },
      });
      console.log('✅ Default category created\n');
    }

    let created = 0;
    let skipped = 0;

    for (const product of dummyProducts) {
      try {
        // Check if product already exists
        const existing = await prisma.part.findUnique({
          where: { partNumber: product.partNumber }
        });

        if (existing) {
          console.log(`⏭️  Skipping "${product.name}" (already exists)`);
          skipped++;
          continue;
        }

        // Create the product
        await prisma.part.create({
          data: {
            ...product,
            categoryId: category.id,
            publishedAt: new Date(),
          },
        });

        console.log(`✅ Created: ${product.name} ($${product.price})`);
        created++;
      } catch (error) {
        console.error(`❌ Failed to create "${product.name}":`, error);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Created: ${created}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   📦 Total: ${dummyProducts.length}`);
    console.log('\n🎉 Done! Products seeded successfully.');

  } catch (error) {
    console.error('\n❌ Error seeding products:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedProducts();

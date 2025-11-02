/**
 * Seed 20 Professional Auto Parts Products
 * 
 * This script clears existing products and adds 20 realistic auto parts
 * with comprehensive details, proper categories, and professional specifications.
 * 
 * Usage:
 *   npx tsx scripts/seed-20-autoparts.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Professional auto part images from Unsplash (automotive/parts themed)
const AUTO_PART_IMAGES = {
  engine: [
    'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800',
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800',
  ],
  brake: [
    'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800',
    'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=800',
  ],
  suspension: [
    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800',
    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800',
  ],
  electrical: [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    'https://images.unsplash.com/photo-1601594988708-c1fa4b84d6ab?w=800',
  ],
  exhaust: [
    'https://images.unsplash.com/photo-1615906655593-ad0986f9f7e4?w=800',
    'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800',
  ],
  filter: [
    'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800',
    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800',
  ],
};

const PRODUCTS_DATA = [
  // ENGINE PARTS
  {
    name: 'Premium Synthetic Oil Filter',
    partNumber: 'OF-2024-S1',
    sku: 'ENG-FLT-001',
    price: 24.99,
    comparePrice: 34.99,
    category: 'Engine Parts',
    shortDesc: 'High-efficiency synthetic media oil filter with 99% filtration efficiency',
    description: 'Premium synthetic oil filter featuring advanced filtration media that captures 99% of harmful contaminants. Extended service interval of up to 10,000 miles. Compatible with synthetic and conventional oils. Features anti-drainback valve to prevent dry starts and silicone anti-drainback valve for superior durability.',
    images: AUTO_PART_IMAGES.filter,
    specifications: {
      'Filter Media': 'Synthetic Blend',
      'Filtration Efficiency': '99%',
      'Service Interval': '10,000 miles',
      'Thread Size': '3/4-16 UNF',
      'Gasket Type': 'Nitrile',
      'Operating Pressure': '150 PSI',
    },
    compatibility: ['Honda', 'Toyota', 'Ford', 'Chevrolet', 'Nissan'],
    brand: 'ProGuard',
    origin: 'USA',
    warranty: '2 years / 24,000 miles',
    difficulty: 'Easy',
    application: ['Passenger Cars', 'Light Trucks', 'SUVs'],
    tags: ['oil filter', 'engine', 'maintenance', 'synthetic'],
    featured: true,
  },
  {
    name: 'Heavy-Duty Serpentine Belt',
    partNumber: 'BLT-HD-2024',
    sku: 'ENG-BLT-002',
    price: 39.99,
    comparePrice: 54.99,
    category: 'Engine Parts',
    shortDesc: 'EPDM rubber serpentine belt with Kevlar reinforcement for extended life',
    description: 'Professional-grade serpentine belt engineered with EPDM rubber and Kevlar reinforcement for superior strength and durability. Resists cracking, glazing, and wear even in extreme temperatures (-40°F to 250°F). Precision-molded ribs ensure optimal grip and reduced noise. 50,000-mile service life.',
    images: AUTO_PART_IMAGES.engine,
    specifications: {
      'Material': 'EPDM Rubber with Kevlar',
      'Length': '95.5 inches',
      'Width': '0.87 inches',
      'Ribs': '6',
      'Temperature Range': '-40°F to 250°F',
      'Tensile Strength': '200 lbs',
    },
    compatibility: ['Ford F-150', 'Dodge Ram', 'Chevrolet Silverado'],
    brand: 'Gates',
    origin: 'USA',
    warranty: '3 years / 50,000 miles',
    difficulty: 'Moderate',
    application: ['Trucks', 'SUVs', 'Commercial Vehicles'],
    tags: ['serpentine belt', 'engine', 'drive belt', 'heavy-duty'],
    featured: true,
  },
  {
    name: 'Performance Air Filter',
    partNumber: 'AF-PERF-500',
    sku: 'ENG-AIR-003',
    price: 49.99,
    comparePrice: 69.99,
    category: 'Engine Parts',
    shortDesc: 'Washable and reusable high-flow air filter for improved performance',
    description: 'High-performance air filter featuring 4-layer cotton gauze media for maximum airflow and filtration. Increases horsepower by up to 5HP and improves fuel economy. Washable and reusable for life - no need for replacement. Easy 10-minute installation with no modifications required.',
    images: AUTO_PART_IMAGES.filter,
    specifications: {
      'Filter Type': 'Cotton Gauze',
      'Layers': '4',
      'Airflow Increase': '50%',
      'Horsepower Gain': 'Up to 5HP',
      'Lifespan': 'Lifetime (washable)',
      'Warranty': '10 years / 1,000,000 miles',
    },
    compatibility: ['Honda Civic', 'Toyota Camry', 'Ford Mustang', 'BMW 3 Series'],
    brand: 'K&N',
    origin: 'USA',
    warranty: '10 years / 1,000,000 miles',
    difficulty: 'Easy',
    application: ['Performance', 'Sport', 'Racing'],
    tags: ['air filter', 'performance', 'reusable', 'high-flow'],
    featured: true,
  },
  {
    name: 'Engine Valve Cover Gasket Set',
    partNumber: 'VCG-2024-PRO',
    sku: 'ENG-GSK-004',
    price: 34.99,
    comparePrice: 49.99,
    category: 'Engine Parts',
    shortDesc: 'Complete valve cover gasket set with seals and grommets',
    description: 'Complete valve cover gasket kit includes gasket, spark plug tube seals, valve cover bolt grommets, and PCV valve grommet. Made from high-quality rubber compound that resists oil, heat, and compression set. Ensures leak-free seal for years of reliable service.',
    images: AUTO_PART_IMAGES.engine,
    specifications: {
      'Material': 'Fluoroelastomer (FKM)',
      'Temperature Rating': '400°F',
      'Kit Includes': 'Gasket, Seals, Grommets',
      'Oil Resistance': 'Excellent',
      'Compression Set': 'Minimal',
    },
    compatibility: ['Honda Accord', 'Toyota Camry', 'Nissan Altima'],
    brand: 'Fel-Pro',
    origin: 'USA',
    warranty: '2 years / unlimited miles',
    difficulty: 'Moderate',
    application: ['Passenger Cars', 'Light Trucks'],
    tags: ['gasket', 'valve cover', 'seal', 'engine'],
  },

  // BRAKE SYSTEM
  {
    name: 'Ceramic Brake Pad Set',
    partNumber: 'BP-CER-2024',
    sku: 'BRK-PAD-005',
    price: 79.99,
    comparePrice: 109.99,
    category: 'Brake System',
    shortDesc: 'Premium ceramic brake pads with low dust and quiet operation',
    description: 'Premium ceramic brake pads engineered for superior stopping power with minimal dust and noise. Features titanium-infused ceramic compound for excellent heat dissipation and consistent performance. Includes premium stainless steel shims and synthetic lubricant. Low dust formula keeps wheels clean.',
    images: AUTO_PART_IMAGES.brake,
    specifications: {
      'Friction Material': 'Ceramic with Titanium',
      'Noise Level': 'Ultra-quiet',
      'Dust Level': 'Very Low',
      'Temperature Range': '0°F to 700°F',
      'Fade Resistance': 'Excellent',
      'Includes': 'Shims and Lubricant',
    },
    compatibility: ['BMW', 'Mercedes-Benz', 'Audi', 'Lexus'],
    brand: 'Akebono',
    origin: 'Japan',
    warranty: '3 years / 36,000 miles',
    difficulty: 'Moderate',
    application: ['Luxury Cars', 'Sport Sedans', 'SUVs'],
    tags: ['brake pads', 'ceramic', 'low dust', 'quiet'],
    featured: true,
  },
  {
    name: 'Performance Brake Rotor (Pair)',
    partNumber: 'BR-PERF-2024',
    sku: 'BRK-ROT-006',
    price: 129.99,
    comparePrice: 179.99,
    category: 'Brake System',
    shortDesc: 'Slotted and drilled brake rotors for improved cooling and performance',
    description: 'High-performance brake rotors featuring cross-drilled and slotted design for maximum heat dissipation and wet weather performance. Manufactured from G3000 cast iron for superior durability. Black e-coating prevents rust and corrosion. Balanced and machined to OE specifications.',
    images: AUTO_PART_IMAGES.brake,
    specifications: {
      'Material': 'G3000 Cast Iron',
      'Design': 'Cross-Drilled & Slotted',
      'Finish': 'Black E-Coating',
      'Diameter': '12.6 inches',
      'Thickness': '1.1 inches',
      'Quantity': '2 rotors (pair)',
    },
    compatibility: ['Ford Mustang', 'Chevrolet Camaro', 'Dodge Challenger'],
    brand: 'StopTech',
    origin: 'USA',
    warranty: '2 years / unlimited miles',
    difficulty: 'Moderate',
    application: ['Performance', 'Sport', 'Street/Track'],
    tags: ['brake rotors', 'performance', 'drilled', 'slotted'],
    featured: true,
  },
  {
    name: 'Brake Caliper Assembly',
    partNumber: 'CAL-2024-REM',
    sku: 'BRK-CAL-007',
    price: 89.99,
    comparePrice: 129.99,
    category: 'Brake System',
    shortDesc: 'Remanufactured brake caliper with new seals and hardware',
    description: 'Premium remanufactured brake caliper thoroughly cleaned, inspected, and rebuilt to OE specifications. Features new rubber seals, dust boots, and bleeder screw. Pressure tested to ensure proper operation. Includes mounting hardware and high-temperature synthetic lubricant.',
    images: AUTO_PART_IMAGES.brake,
    specifications: {
      'Type': 'Remanufactured',
      'Piston Material': 'Stainless Steel',
      'Finish': 'Powder Coated',
      'Testing': 'Pressure Tested',
      'Includes': 'Hardware & Lubricant',
    },
    compatibility: ['Honda Civic', 'Toyota Corolla', 'Mazda 3'],
    brand: 'Cardone',
    origin: 'USA',
    warranty: 'Lifetime',
    difficulty: 'Advanced',
    application: ['Passenger Cars', 'Compact SUVs'],
    tags: ['brake caliper', 'remanufactured', 'assembly'],
  },
  {
    name: 'Stainless Steel Brake Lines',
    partNumber: 'BL-SS-2024',
    sku: 'BRK-LIN-008',
    price: 64.99,
    comparePrice: 89.99,
    category: 'Brake System',
    shortDesc: 'Braided stainless steel brake lines for improved pedal feel',
    description: 'Performance braided stainless steel brake lines provide firmer pedal feel and improved braking response. DOT-approved PTFE inner line with stainless steel braiding and PVC protective coating. Direct bolt-on installation with all necessary fittings included.',
    images: AUTO_PART_IMAGES.brake,
    specifications: {
      'Inner Line': 'PTFE (Teflon)',
      'Outer Braid': 'Stainless Steel',
      'Coating': 'Clear PVC',
      'DOT Approved': 'Yes',
      'Fittings': 'Stainless Steel',
      'Lines Per Kit': '4',
    },
    compatibility: ['Subaru WRX', 'Honda Civic Si', 'VW GTI'],
    brand: 'Goodridge',
    origin: 'UK',
    warranty: 'Lifetime',
    difficulty: 'Moderate',
    application: ['Performance', 'Sport', 'Track'],
    tags: ['brake lines', 'stainless steel', 'performance', 'upgrade'],
  },

  // SUSPENSION
  {
    name: 'Gas-Charged Shock Absorber',
    partNumber: 'SHK-GAS-2024',
    sku: 'SUS-SHK-009',
    price: 99.99,
    comparePrice: 139.99,
    category: 'Suspension',
    shortDesc: 'Twin-tube gas shock for superior ride comfort and control',
    description: 'Premium gas-charged shock absorber featuring twin-tube design for exceptional ride quality and handling. Precision-valved for optimal damping in all conditions. All-weather fluid for consistent performance from -40°F to 150°F. Protective boot included to prevent contamination.',
    images: AUTO_PART_IMAGES.suspension,
    specifications: {
      'Type': 'Twin-Tube Gas',
      'Damping': 'Velocity-Sensitive',
      'Fluid': 'All-Weather Synthetic',
      'Finish': 'E-Coated',
      'Mounting': 'OE-Style',
      'Boot Included': 'Yes',
    },
    compatibility: ['Ford F-150', 'Ram 1500', 'Chevrolet Silverado'],
    brand: 'Bilstein',
    origin: 'Germany',
    warranty: 'Lifetime',
    difficulty: 'Moderate',
    application: ['Trucks', 'SUVs', 'Off-Road'],
    tags: ['shock absorber', 'suspension', 'gas-charged', 'ride quality'],
    featured: true,
  },
  {
    name: 'Coil Spring Assembly',
    partNumber: 'SPR-COIL-2024',
    sku: 'SUS-SPR-010',
    price: 74.99,
    comparePrice: 99.99,
    category: 'Suspension',
    shortDesc: 'Heavy-duty coil spring for restored ride height and load capacity',
    description: 'Heavy-duty coil spring manufactured from high-tensile steel wire with progressive rate design. Restores original ride height and improves load-carrying capacity. Shot-peened and powder-coated for maximum durability and corrosion resistance.',
    images: AUTO_PART_IMAGES.suspension,
    specifications: {
      'Material': 'High-Tensile Steel',
      'Wire Diameter': '14mm',
      'Spring Rate': 'Progressive',
      'Load Capacity': '+500 lbs',
      'Finish': 'Powder Coated',
      'Length': '16 inches',
    },
    compatibility: ['Jeep Wrangler', 'Toyota Tacoma', 'Ford Ranger'],
    brand: 'Eibach',
    origin: 'Germany',
    warranty: 'Lifetime',
    difficulty: 'Advanced',
    application: ['Off-Road', 'Trucks', '4x4'],
    tags: ['coil spring', 'suspension', 'heavy-duty', 'lift'],
  },
  {
    name: 'Sway Bar End Link Kit',
    partNumber: 'SBL-2024-HD',
    sku: 'SUS-SBL-011',
    price: 29.99,
    comparePrice: 44.99,
    category: 'Suspension',
    shortDesc: 'Heavy-duty sway bar end links with greaseable ball joints',
    description: 'Heavy-duty sway bar end link kit with greaseable ball joints for extended service life. Hardened steel construction with protective zinc plating. Eliminates clunking noises and improves handling. Includes all necessary hardware for installation.',
    images: AUTO_PART_IMAGES.suspension,
    specifications: {
      'Material': 'Hardened Steel',
      'Finish': 'Zinc Plated',
      'Ball Joint Type': 'Greaseable',
      'Thread Size': 'M10x1.5',
      'Kit Quantity': '2 links',
      'Hardware Included': 'Yes',
    },
    compatibility: ['Honda Accord', 'Toyota Camry', 'Nissan Altima', 'Mazda 6'],
    brand: 'Moog',
    origin: 'USA',
    warranty: 'Lifetime',
    difficulty: 'Easy',
    application: ['Passenger Cars', 'Sedans'],
    tags: ['sway bar', 'end link', 'suspension', 'handling'],
  },
  {
    name: 'Control Arm Bushing Set',
    partNumber: 'CAB-POLY-2024',
    sku: 'SUS-BSH-012',
    price: 54.99,
    comparePrice: 74.99,
    category: 'Suspension',
    shortDesc: 'Polyurethane control arm bushings for improved handling',
    description: 'High-performance polyurethane control arm bushings provide superior handling and responsiveness compared to stock rubber. Resists compression and deformation under load. Reduces wheel hop and improves steering precision. Installation hardware and lubricant included.',
    images: AUTO_PART_IMAGES.suspension,
    specifications: {
      'Material': '95A Polyurethane',
      'Hardness': '95 Shore A',
      'Color': 'Black',
      'UV Resistant': 'Yes',
      'Chemical Resistant': 'Yes',
      'Kit Includes': 'Bushings & Sleeves',
    },
    compatibility: ['Subaru WRX', 'Mitsubishi Evo', 'Nissan 350Z'],
    brand: 'Whiteline',
    origin: 'Australia',
    warranty: '3 years',
    difficulty: 'Advanced',
    application: ['Performance', 'Sport', 'Track'],
    tags: ['bushings', 'polyurethane', 'suspension', 'performance'],
  },

  // ELECTRICAL
  {
    name: 'High-Output Alternator',
    partNumber: 'ALT-HO-2024',
    sku: 'ELC-ALT-013',
    price: 189.99,
    comparePrice: 259.99,
    category: 'Electrical',
    shortDesc: 'Remanufactured 160-amp alternator for high-demand electrical systems',
    description: 'High-output 160-amp alternator perfect for vehicles with upgraded audio systems, lighting, or accessories. Professionally remanufactured with new bearings, rectifier, and voltage regulator. Computer-tested to ensure proper output. Includes replacement pulley.',
    images: AUTO_PART_IMAGES.electrical,
    specifications: {
      'Output': '160 amps',
      'Voltage': '12V',
      'Type': 'Remanufactured',
      'Pulley': 'New OE-Style',
      'Regulator': 'Internal',
      'Testing': '100% Computer Tested',
    },
    compatibility: ['Ford F-150', 'Chevrolet Tahoe', 'GMC Sierra'],
    brand: 'PowerMax',
    origin: 'USA',
    warranty: 'Lifetime',
    difficulty: 'Moderate',
    application: ['Trucks', 'SUVs', 'High-Draw Systems'],
    tags: ['alternator', 'high-output', 'electrical', 'charging'],
    featured: true,
  },
  {
    name: 'AGM Battery',
    partNumber: 'BAT-AGM-2024',
    sku: 'ELC-BAT-014',
    price: 159.99,
    comparePrice: 219.99,
    category: 'Electrical',
    shortDesc: 'Absorbed Glass Mat battery with 850 cold cranking amps',
    description: 'Premium AGM battery with 850 CCA for reliable starting power in all conditions. Maintenance-free design with spill-proof construction. Superior vibration resistance and faster recharge rate. Perfect for vehicles with start-stop systems and high electrical demands.',
    images: AUTO_PART_IMAGES.electrical,
    specifications: {
      'Cold Cranking Amps': '850 CCA',
      'Reserve Capacity': '120 minutes',
      'Type': 'AGM (Absorbent Glass Mat)',
      'Voltage': '12V',
      'Maintenance': 'Free',
      'Vibration Resistant': 'Yes',
    },
    compatibility: ['Universal Fitment', 'Group 48 Size'],
    brand: 'Optima',
    origin: 'USA',
    warranty: '3 years',
    difficulty: 'Easy',
    application: ['All Vehicles', 'Start-Stop', 'Marine'],
    tags: ['battery', 'AGM', 'high-performance', 'maintenance-free'],
    featured: true,
  },
  {
    name: 'Oxygen Sensor',
    partNumber: 'O2-SEN-2024',
    sku: 'ELC-O2S-015',
    price: 49.99,
    comparePrice: 69.99,
    category: 'Electrical',
    shortDesc: 'Heated oxygen sensor for accurate air/fuel ratio monitoring',
    description: 'Premium heated oxygen sensor with rapid light-off for faster closed-loop operation. Features laser-welded construction and OE-quality zirconia sensing element. Improves fuel economy and reduces emissions. Plug-and-play installation.',
    images: AUTO_PART_IMAGES.electrical,
    specifications: {
      'Type': 'Heated (4-wire)',
      'Sensing Element': 'Zirconia',
      'Response Time': '< 10 seconds',
      'Connector': 'OE-Style',
      'Wire Length': '12 inches',
      'Operating Temp': '600°F - 1200°F',
    },
    compatibility: ['Honda', 'Toyota', 'Nissan', 'Mazda'],
    brand: 'Bosch',
    origin: 'Germany',
    warranty: '4 years / 50,000 miles',
    difficulty: 'Moderate',
    application: ['Passenger Cars', 'Light Trucks'],
    tags: ['oxygen sensor', 'O2 sensor', 'emissions', 'fuel economy'],
  },
  {
    name: 'Ignition Coil Pack',
    partNumber: 'IGC-2024-PRO',
    sku: 'ELC-IGC-016',
    price: 44.99,
    comparePrice: 64.99,
    category: 'Electrical',
    shortDesc: 'High-performance ignition coil with enhanced spark energy',
    description: 'High-performance ignition coil delivers up to 15% more spark energy for improved combustion and throttle response. Features epoxy-filled housing for superior heat dissipation and moisture resistance. OE connector for plug-and-play installation.',
    images: AUTO_PART_IMAGES.electrical,
    specifications: {
      'Primary Resistance': '0.5 ohms',
      'Secondary Resistance': '12K ohms',
      'Spark Output': '+15%',
      'Housing': 'Epoxy-Filled',
      'Operating Voltage': '12V',
      'Peak Voltage': '45,000V',
    },
    compatibility: ['Ford', 'Chevrolet', 'Dodge', 'Chrysler'],
    brand: 'Delphi',
    origin: 'USA',
    warranty: '2 years / unlimited miles',
    difficulty: 'Easy',
    application: ['Passenger Cars', 'Trucks'],
    tags: ['ignition coil', 'performance', 'spark', 'engine'],
  },

  // EXHAUST SYSTEM
  {
    name: 'Performance Catalytic Converter',
    partNumber: 'CAT-PERF-2024',
    sku: 'EXH-CAT-017',
    price: 249.99,
    comparePrice: 349.99,
    category: 'Exhaust System',
    shortDesc: 'High-flow catalytic converter with EPA compliance',
    description: 'High-flow catalytic converter features efficient honeycomb substrate for reduced backpressure and improved performance. EPA and CARB compliant. Stainless steel construction with heat shield. Increases horsepower while maintaining clean emissions.',
    images: AUTO_PART_IMAGES.exhaust,
    specifications: {
      'Substrate': 'High-Density Honeycomb',
      'Material': '409 Stainless Steel',
      'EPA Compliant': 'Yes',
      'CARB Compliant': 'Yes',
      'Cell Count': '400 CPSI',
      'HP Gain': 'Up to 12HP',
    },
    compatibility: ['Honda Civic', 'Toyota Corolla', 'Mazda 3'],
    brand: 'MagnaFlow',
    origin: 'USA',
    warranty: '25 years / unlimited miles',
    difficulty: 'Advanced',
    application: ['Performance', 'Street Legal', 'Emissions'],
    tags: ['catalytic converter', 'high-flow', 'performance', 'EPA'],
    featured: true,
  },
  {
    name: 'Stainless Steel Muffler',
    partNumber: 'MUF-SS-2024',
    sku: 'EXH-MUF-018',
    price: 129.99,
    comparePrice: 179.99,
    category: 'Exhaust System',
    shortDesc: 'Aluminized steel muffler with aggressive sound and long life',
    description: 'Premium stainless steel muffler delivers deep, aggressive tone without drone. Straight-through perforated core design reduces backpressure for improved flow. TIG-welded construction ensures leak-free operation. Polished stainless steel finish.',
    images: AUTO_PART_IMAGES.exhaust,
    specifications: {
      'Material': '304 Stainless Steel',
      'Core Design': 'Straight-Through',
      'Sound Level': 'Aggressive',
      'Finish': 'Polished',
      'Inlet/Outlet': '2.5 inches',
      'Length': '22 inches',
    },
    compatibility: ['Ford Mustang', 'Chevrolet Camaro', 'Dodge Charger'],
    brand: 'Borla',
    origin: 'USA',
    warranty: 'Million Mile',
    difficulty: 'Moderate',
    application: ['Performance', 'Sport', 'Muscle Cars'],
    tags: ['muffler', 'exhaust', 'stainless steel', 'performance sound'],
  },
  {
    name: 'Exhaust Flex Pipe',
    partNumber: 'EFP-2024-HD',
    sku: 'EXH-FLX-019',
    price: 39.99,
    comparePrice: 54.99,
    category: 'Exhaust System',
    shortDesc: 'Heavy-duty exhaust flex pipe with double-wall construction',
    description: 'Heavy-duty exhaust flex pipe with double-wall braided construction for maximum durability. Absorbs engine movement and vibration to prevent exhaust stress cracks. Aluminized steel construction resists corrosion. Universal fit with weld-on installation.',
    images: AUTO_PART_IMAGES.exhaust,
    specifications: {
      'Construction': 'Double-Wall Braided',
      'Material': 'Aluminized Steel',
      'Inner Diameter': '2 inches',
      'Overall Length': '10 inches',
      'Flex Length': '6 inches',
      'Connection': 'Weld-On',
    },
    compatibility: ['Universal Application'],
    brand: 'Walker',
    origin: 'USA',
    warranty: '2 years',
    difficulty: 'Advanced',
    application: ['All Vehicles', 'Repair', 'Custom'],
    tags: ['flex pipe', 'exhaust', 'universal', 'repair'],
  },
  {
    name: 'Exhaust Gasket & Hardware Kit',
    partNumber: 'EGK-2024-UNI',
    sku: 'EXH-GSK-020',
    price: 19.99,
    comparePrice: 29.99,
    category: 'Exhaust System',
    shortDesc: 'Complete exhaust gasket kit with high-temp hardware',
    description: 'Complete exhaust gasket and hardware kit includes all gaskets, studs, nuts, and washers needed for exhaust system installation. High-temperature gaskets withstand 2000°F. Stainless steel hardware prevents rust and seizing. Perfect for repairs or custom installations.',
    images: AUTO_PART_IMAGES.exhaust,
    specifications: {
      'Gasket Material': 'Multi-Layer Steel',
      'Temperature Rating': '2000°F',
      'Hardware Material': 'Stainless Steel',
      'Kit Includes': 'Gaskets, Studs, Nuts, Washers',
      'Quantity': '20 pieces',
    },
    compatibility: ['Universal Application'],
    brand: 'Vibrant',
    origin: 'USA',
    warranty: '1 year',
    difficulty: 'Easy',
    application: ['All Vehicles', 'Repair', 'Installation'],
    tags: ['gasket', 'exhaust', 'hardware', 'installation kit'],
  },
];

async function main() {
  console.log('🚀 Starting Auto Parts Seed Process...\n');

  try {
    // Step 1: Clear existing products
    console.log('🗑️  Clearing existing products...');
    const deletedParts = await prisma.part.deleteMany({});
    console.log(`   ✅ Deleted ${deletedParts.count} existing products\n`);

    // Step 2: Ensure categories exist
    console.log('📁 Setting up categories...');
    const categoryNames = [
      'Engine Parts',
      'Brake System',
      'Suspension',
      'Electrical',
      'Exhaust System',
    ];

    const categories = new Map<string, string>();

    for (const categoryName of categoryNames) {
      const category = await prisma.category.upsert({
        where: { name: categoryName },
        update: {},
        create: {
          name: categoryName,
          slug: categoryName.toLowerCase().replace(/\s+/g, '-'),
          description: `Professional ${categoryName.toLowerCase()} for all makes and models`,
        },
      });
      categories.set(categoryName, category.id);
      console.log(`   ✅ Category: ${categoryName}`);
    }
    console.log('');

    // Step 3: Create products
    console.log('🔧 Creating 20 professional auto parts...\n');

    let createdCount = 0;
    let featuredCount = 0;

    for (const productData of PRODUCTS_DATA) {
      const categoryId = categories.get(productData.category);
      if (!categoryId) {
        console.error(`   ❌ Category not found: ${productData.category}`);
        continue;
      }

      const part = await prisma.part.create({
        data: {
          name: productData.name,
          slug: productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          partNumber: productData.partNumber,
          sku: productData.sku,
          price: productData.price,
          comparePrice: productData.comparePrice,
          categoryId,
          shortDesc: productData.shortDesc,
          description: productData.description,
          images: productData.images,
          specifications: productData.specifications,
          compatibility: productData.compatibility,
          brand: productData.brand,
          origin: productData.origin,
          warranty: productData.warranty,
          difficulty: productData.difficulty,
          application: productData.application,
          tags: productData.tags,
          featured: productData.featured || false,
          published: true,
          publishedAt: new Date(),
          showcaseOrder: createdCount,
        },
      });

      createdCount++;
      if (part.featured) featuredCount++;

      const priceDisplay = productData.comparePrice
        ? `$${productData.price} (was $${productData.comparePrice})`
        : `$${productData.price}`;

      console.log(`   ${createdCount}. ${part.name}`);
      console.log(`      SKU: ${part.sku} | ${priceDisplay}`);
      console.log(`      Category: ${productData.category}${part.featured ? ' ⭐ FEATURED' : ''}`);
      console.log('');
    }

    // Step 4: Summary
    console.log('✅ SEED COMPLETED SUCCESSFULLY!\n');
    console.log('📊 Summary:');
    console.log(`   • Products Created: ${createdCount}`);
    console.log(`   • Featured Products: ${featuredCount}`);
    console.log(`   • Categories: ${categoryNames.length}`);
    console.log(`   • All products published: Yes`);
    console.log('');
    console.log('🌐 View your products at:');
    console.log('   • Website: http://localhost:3000/parts');
    console.log('   • Admin: http://localhost:3000/admin/parts');
    console.log('');

  } catch (error) {
    console.error('\n❌ Error during seed process:');
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

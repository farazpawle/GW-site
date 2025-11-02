import { PrismaClient } from '@prisma/client'
import { seedSettings } from '../scripts/seed-settings'

const prisma = new PrismaClient()

async function main() {
  // Phase 9: Seed new settings system
  await seedSettings()

  // Seed site settings (legacy - can be migrated to new settings system later)
  await prisma.siteSettings.upsert({
    where: { key: 'ecommerce_enabled' },
    update: {},
    create: {
      key: 'ecommerce_enabled',
      value: false  // Boolean value, not nested object
    }
  })

  await prisma.siteSettings.upsert({
    where: { key: 'currency' },
    update: {},
    create: {
      key: 'currency',
      value: {
        code: 'AED',
        symbol: 'AED',
        position: 'before'
      }
    }
  })

  await prisma.siteSettings.upsert({
    where: { key: 'contact_info' },
    update: {},
    create: {
      key: 'contact_info',
      value: {
        email: 'info@garritwulf.com',
        phone: '+971502345678',
        whatsapp: '+971502345678'
      }
    }
  })

  console.log('Site settings seeded successfully!')

  // Create categories (using upsert for idempotency)
  const europeanCategory = await prisma.category.upsert({
    where: { slug: 'european-parts' },
    update: {},
    create: {
      name: 'European Parts',
      slug: 'european-parts',
      description: 'Precision-engineered components tailored for European vehicles.',
      image: '/images/european-parts.jpg'
    }
  })

  const americanCategory = await prisma.category.upsert({
    where: { slug: 'american-parts' },
    update: {},
    create: {
      name: 'American Parts',
      slug: 'american-parts',
      description: 'Reliable, high-performance parts for American cars and SUVs.',
      image: '/images/american-parts.jpg'
    }
  })

  const truckCategory = await prisma.category.upsert({
    where: { slug: 'truck-parts' },
    update: {},
    create: {
      name: 'Truck Parts',
      slug: 'truck-parts',
      description: 'Robust components built to support heavy-duty truck applications.',
      image: '/images/truck-parts.jpg'
    }
  })

  // Create some sample parts
  const parts = [
    {
      name: 'High-Performance Engine Block',
      slug: 'high-performance-engine-block',
      shortDesc: 'Premium engine block for European vehicles',
      description: 'A high-quality engine block designed for European vehicles, manufactured with precision engineering and tested for reliability.',
      partNumber: 'GW-ENG-001',
      price: 2500.00,
      comparePrice: 3000.00,
      inStock: true,
      stockQuantity: 15,
      images: ['/images/engine-block.jpg', '/images/engine-block-2.jpg'],
      specifications: {
        material: 'Cast Iron',
        weight: '45kg',
        compatibility: ['BMW', 'Mercedes', 'Audi'],
        warranty: '2 years'
      },
      compatibility: ['BMW 3 Series', 'Mercedes C-Class', 'Audi A4'],
      categoryId: europeanCategory.id,
      featured: true
    },
    {
      name: 'Advanced Transmission System',
      slug: 'advanced-transmission-system',
      shortDesc: 'Smooth gear shifting transmission',
      description: 'Durable transmission system components for smooth gear shifting and enhanced performance.',
      partNumber: 'GW-TRA-002',
      price: 1800.00,
      inStock: true,
      stockQuantity: 8,
      images: ['/images/transmission.jpg'],
      specifications: {
        type: 'Automatic',
        gears: '8-Speed',
        torque: '500 Nm'
      },
      compatibility: ['Ford F-150', 'Chevrolet Silverado', 'Dodge Ram'],
      categoryId: americanCategory.id,
      featured: true
    },
    {
      name: 'Heavy-Duty Brake System',
      slug: 'heavy-duty-brake-system',
      shortDesc: 'Enhanced safety braking system',
      description: 'Reliable brake system parts designed for enhanced safety and performance in heavy-duty applications.',
      partNumber: 'GW-BRK-003',
      price: 950.00,
      inStock: true,
      stockQuantity: 25,
      images: ['/images/brake-system.jpg'],
      specifications: {
        type: 'Disc Brake',
        material: 'Carbon Ceramic',
        diameter: '370mm'
      },
      compatibility: ['Volvo FH', 'Scania R-Series', 'MAN TGX'],
      categoryId: truckCategory.id,
      featured: true
    },
    {
      name: 'Advanced Electrical Components',
      slug: 'advanced-electrical-components',
      shortDesc: 'Modern vehicle electrical system',
      description: 'Advanced electrical components for modern vehicles with cutting-edge technology.',
      partNumber: 'GW-ELE-004',
      price: 450.00,
      inStock: true,
      stockQuantity: 30,
      images: ['/images/electrical.jpg'],
      specifications: {
        voltage: '12V',
        current: '100A',
        type: 'LED System'
      },
      compatibility: ['Tesla Model S', 'BMW i3', 'Audi e-tron'],
      categoryId: europeanCategory.id,
      featured: false
    }
  ]

  for (const part of parts) {
    await prisma.part.upsert({
      where: { partNumber: part.partNumber },
      update: {},
      create: part
    })
  }

  console.log('Sample parts seeded successfully!')

  // ============================================
  // Phase 5: Navigation & Product Management
  // ============================================

  // Create default "All Products" page
  const allProductsPage = await prisma.page.upsert({
    where: { slug: 'all-products' },
    update: {},
    create: {
      title: 'All Products',
      slug: 'all-products',
      groupType: 'all',
      groupValues: { showAll: true },
      layout: 'grid',
      sortBy: 'name',
      itemsPerPage: 24,
      metaTitle: 'All Products - Garrit & Wulf',
      metaDesc: 'Browse our complete catalog of premium automotive parts for European, American, and Truck vehicles.',
      published: true,
    }
  })

  console.log('Default page seeded successfully!')

  // Create main menu items (check for existing items first)
  const existingMenuItems = await prisma.menuItem.findMany()
  
  if (existingMenuItems.length === 0) {
    await prisma.menuItem.createMany({
      data: [
        {
          label: 'Home',
          externalUrl: '/',
          position: 1,
          visible: true,
        },
        {
          label: 'Products',
          pageId: allProductsPage.id,
          position: 2,
          visible: true,
        },
        {
          label: 'About',
          externalUrl: '/about',
          position: 3,
          visible: true,
        },
        {
          label: 'Contact',
          externalUrl: '/contact',
          position: 4,
          visible: true,
        }
      ]
    })
  }

  console.log('Menu items seeded successfully!')

  // Create "Featured Parts" collection
  await prisma.collection.upsert({
    where: { slug: 'featured-parts' },
    update: {},
    create: {
      name: 'Featured Parts',
      slug: 'featured-parts',
      description: 'Our handpicked selection of premium automotive parts',
      filterRules: {
        featured: true,
      },
      useManual: false,
      layout: 'grid',
      sortBy: 'name',
      itemsPerPage: 12,
      metaTitle: 'Featured Parts - Garrit & Wulf',
      metaDesc: 'Discover our featured collection of high-quality automotive parts for European, American, and Truck vehicles.',
      published: true,
    }
  })

  console.log('Default collection seeded successfully!')

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
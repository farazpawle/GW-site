/**
 * Setup Navigation - Create sample pages and menu items
 * This script creates:
 * - Sample static pages (About Us, Contact)
 * - Sample dynamic product pages (All Parts, Engine Parts, Transmission Parts)
 * - Menu items linking to these pages
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting navigation setup...\n');

  // Step 1: Create static pages
  console.log('📄 Creating static pages...');
  
  const aboutPage = await prisma.page.upsert({
    where: { slug: 'about-us' },
    update: {},
    create: {
      title: 'About Us',
      slug: 'about-us',
      description: 'Learn more about Garrit & Wulf',
      pageType: 'static',
      content: `
        <div class="max-w-4xl mx-auto py-12 px-6">
          <h1 class="text-4xl font-bold text-gray-900 mb-6">About Garrit & Wulf</h1>
          
          <div class="prose prose-lg">
            <p class="text-xl text-gray-700 mb-6">
              Welcome to Garrit & Wulf - Your trusted partner in premium automotive parts.
            </p>
            
            <h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Our Story</h2>
            <p class="text-gray-700 mb-4">
              Founded with a passion for excellence, we specialize in providing high-quality 
              automotive components for discerning customers worldwide.
            </p>
            
            <h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Our Commitment</h2>
            <ul class="list-disc pl-6 text-gray-700 space-y-2">
              <li>Premium quality parts from trusted manufacturers</li>
              <li>Expert technical support and guidance</li>
              <li>Fast and reliable shipping worldwide</li>
              <li>Competitive pricing without compromising quality</li>
            </ul>
            
            <div class="mt-8 p-6 bg-gray-100 rounded-lg">
              <p class="text-center text-gray-700">
                <strong>Note:</strong> You can edit this content in the Admin Panel → Pages → About Us
              </p>
            </div>
          </div>
        </div>
      `,
      metaTitle: 'About Us - Garrit & Wulf',
      metaDesc: 'Learn about Garrit & Wulf, your trusted source for premium automotive parts.',
      published: true,
      publishedAt: new Date(),
    },
  });
  console.log('✅ Created: About Us page');

  const contactPage = await prisma.page.upsert({
    where: { slug: 'contact-us' },
    update: {},
    create: {
      title: 'Contact Us',
      slug: 'contact-us',
      description: 'Get in touch with our team',
      pageType: 'static',
      content: `
        <div class="max-w-4xl mx-auto py-12 px-6">
          <h1 class="text-4xl font-bold text-gray-900 mb-6">Contact Us</h1>
          
          <div class="grid md:grid-cols-2 gap-8">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 mb-4">Get in Touch</h2>
              <p class="text-gray-700 mb-6">
                Have questions about our products? Need technical support? 
                We're here to help!
              </p>
              
              <div class="space-y-4">
                <div class="flex items-start gap-3">
                  <div class="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white">
                    📧
                  </div>
                  <div>
                    <p class="font-semibold text-gray-900">Email</p>
                    <p class="text-gray-700">info@garritandwulf.com</p>
                  </div>
                </div>
                
                <div class="flex items-start gap-3">
                  <div class="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white">
                    📞
                  </div>
                  <div>
                    <p class="font-semibold text-gray-900">Phone</p>
                    <p class="text-gray-700">+1 (555) 123-4567</p>
                  </div>
                </div>
                
                <div class="flex items-start gap-3">
                  <div class="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white">
                    📍
                  </div>
                  <div>
                    <p class="font-semibold text-gray-900">Address</p>
                    <p class="text-gray-700">123 Auto Parts Ave<br>Detroit, MI 48201</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="bg-gray-50 p-6 rounded-lg">
              <h3 class="text-xl font-bold text-gray-900 mb-4">Business Hours</h3>
              <div class="space-y-2 text-gray-700">
                <p><strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM</p>
                <p><strong>Saturday:</strong> 10:00 AM - 4:00 PM</p>
                <p><strong>Sunday:</strong> Closed</p>
              </div>
              
              <div class="mt-6 p-4 bg-white rounded border border-gray-200">
                <p class="text-sm text-gray-600">
                  <strong>Admin Note:</strong> Edit this page in Admin Panel → Pages → Contact Us
                </p>
              </div>
            </div>
          </div>
        </div>
      `,
      metaTitle: 'Contact Us - Garrit & Wulf',
      metaDesc: 'Get in touch with Garrit & Wulf. We are here to help with your automotive parts needs.',
      published: true,
      publishedAt: new Date(),
    },
  });
  console.log('✅ Created: Contact Us page');

  // Step 2: Create dynamic product pages
  console.log('\n🔧 Creating dynamic product pages...');

  const allPartsPage = await prisma.page.upsert({
    where: { slug: 'all-parts' },
    update: {},
    create: {
      title: 'All Parts',
      slug: 'all-parts',
      description: 'Browse all automotive parts',
      pageType: 'dynamic',
      groupType: 'category',
      groupValues: { categoryIds: [] }, // Empty = show all
      layout: 'grid',
      sortBy: 'name',
      itemsPerPage: 24,
      metaTitle: 'All Automotive Parts - Garrit & Wulf',
      metaDesc: 'Browse our complete catalog of premium automotive parts.',
      published: true,
      publishedAt: new Date(),
    },
  });
  console.log('✅ Created: All Parts page (shows all products)');

  // Get some category IDs for sample pages
  const categories = await prisma.category.findMany({
    take: 3,
    select: { id: true, name: true },
  });

  if (categories.length > 0) {
    await prisma.page.upsert({
      where: { slug: 'engine-parts' },
      update: {},
      create: {
        title: 'Engine Parts',
        slug: 'engine-parts',
        description: 'Premium engine components',
        pageType: 'dynamic',
        groupType: 'category',
        groupValues: { categoryIds: [categories[0].id] },
        layout: 'grid',
        sortBy: 'name',
        itemsPerPage: 24,
        metaTitle: 'Engine Parts - Garrit & Wulf',
        metaDesc: 'High-quality engine parts and components.',
        published: true,
        publishedAt: new Date(),
      },
    });
    console.log(`✅ Created: Engine Parts page (category: ${categories[0].name})`);
  }

  // Step 3: Delete existing menu items to start fresh
  console.log('\n🗑️  Clearing existing menu items...');
  await prisma.menuItem.deleteMany({});
  console.log('✅ Cleared old menu items');

  // Step 4: Create menu items
  console.log('\n📋 Creating menu items...');

  await prisma.menuItem.create({
    data: {
      label: 'Home',
      externalUrl: '/',
      position: 1,
      visible: true,
      openNewTab: false,
    },
  });
  console.log('✅ Created: Home menu item');

  await prisma.menuItem.create({
    data: {
      label: 'Products',
      pageId: allPartsPage.id,
      position: 2,
      visible: true,
      openNewTab: false,
    },
  });
  console.log('✅ Created: Products menu item → All Parts page');

  await prisma.menuItem.create({
    data: {
      label: 'About',
      pageId: aboutPage.id,
      position: 3,
      visible: true,
      openNewTab: false,
    },
  });
  console.log('✅ Created: About menu item → About Us page');

  await prisma.menuItem.create({
    data: {
      label: 'Contact',
      pageId: contactPage.id,
      position: 4,
      visible: true,
      openNewTab: false,
    },
  });
  console.log('✅ Created: Contact menu item → Contact Us page');

  console.log('\n✨ Navigation setup complete!\n');
  console.log('📌 What was created:');
  console.log('   - 2 Static pages: About Us, Contact Us');
  console.log('   - 1 Product page: All Parts');
  console.log('   - 4 Menu items: Home, Products, About, Contact\n');
  console.log('🎯 Next steps:');
  console.log('   1. Refresh your website - you should see menu buttons now!');
  console.log('   2. Click "Products" to see all parts');
  console.log('   3. Click "About" or "Contact" to see static content');
  console.log('   4. Login to /admin to edit pages and create more\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { prisma } from '../src/lib/prisma';

/**
 * Seed Default Pages Script
 * 
 * Creates 4 default pages that are essential for the navigation menu:
 * - Home (/)
 * - Products (/products)
 * - About Us (/about)
 * - Contact Us (/contact)
 * 
 * These pages are configured to show all products and are published by default.
 * The script is idempotent - safe to run multiple times.
 */

const defaultPages = [
  {
    slug: 'home',
    title: 'Home',
    description: 'Welcome to our store - Browse all our premium auto parts',
    groupType: 'all',
    groupValues: {},
    layout: 'grid',
    sortBy: 'name',
    itemsPerPage: 12,
    published: true,
    isPermanent: true, // Home page cannot be deleted
  },
  {
    slug: 'products',
    title: 'Products',
    description: 'Browse our complete catalog of premium auto parts',
    groupType: 'all',
    groupValues: {},
    layout: 'grid',
    sortBy: 'name',
    itemsPerPage: 20,
    published: true,
    isPermanent: false,
  },
  {
    slug: 'about',
    title: 'About Us',
    description: 'Learn more about our company and commitment to quality',
    groupType: 'all',
    groupValues: {},
    layout: 'grid',
    sortBy: 'name',
    itemsPerPage: 12,
    published: true,
    isPermanent: true, // About Us page cannot be deleted
  },
  {
    slug: 'contact',
    title: 'Contact Us',
    description: 'Get in touch with our team for inquiries and support',
    groupType: 'all',
    groupValues: {},
    layout: 'grid',
    sortBy: 'name',
    itemsPerPage: 12,
    published: true,
    isPermanent: true, // Contact Us page cannot be deleted
  },
];

async function main() {
  console.log('🌱 Seeding Default Pages...\n');

  let createdCount = 0;
  let existingCount = 0;

  for (const page of defaultPages) {
    try {
      const result = await prisma.page.upsert({
        where: { slug: page.slug },
        update: {
          // Update only if needed, keeping existing data mostly intact
          published: page.published,
          title: page.title,
          description: page.description,
          isPermanent: page.isPermanent,
        },
        create: {
          ...page,
          publishedAt: new Date(),
        },
      });

      // Check if it was just created or already existed
      const isNew = result.createdAt.getTime() === result.updatedAt.getTime();
      
      if (isNew) {
        createdCount++;
        console.log(`✅ Created page: ${page.title} (/${page.slug})`);
      } else {
        existingCount++;
        console.log(`♻️  Updated existing page: ${page.title} (/${page.slug})`);
      }
    } catch (error) {
      console.error(`❌ Error processing page "${page.title}":`, error);
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   Created: ${createdCount} page(s)`);
  console.log(`   Updated: ${existingCount} page(s)`);
  console.log(`   Total: ${defaultPages.length} page(s)\n`);
  console.log('✨ Default pages seeding complete!\n');
}

main()
  .catch((error) => {
    console.error('❌ Fatal error during seeding:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { prisma } from '../src/lib/prisma';

/**
 * Seed Default Menu Items Script
 * 
 * Creates 4 default menu items that link to the essential pages:
 * - HOME → /home
 * - PRODUCTS → /products
 * - ABOUT US → /about
 * - CONTACT US → /contact
 * 
 * These menu items will appear in the navigation bar.
 * The script is idempotent - safe to run multiple times.
 * 
 * PREREQUISITE: Run seed-default-pages.ts first to create the pages.
 */

interface MenuItemConfig {
  label: string;
  pageSlug: string;
  position: number;
  isPermanent: boolean;
}

const defaultMenuItems: MenuItemConfig[] = [
  { label: 'HOME', pageSlug: 'home', position: 0, isPermanent: true },
  { label: 'PRODUCTS', pageSlug: 'products', position: 1, isPermanent: false },
  { label: 'ABOUT US', pageSlug: 'about', position: 2, isPermanent: true },
  { label: 'CONTACT US', pageSlug: 'contact', position: 3, isPermanent: true },
];

async function main() {
  console.log('🌱 Seeding Default Menu Items...\n');

  // First, fetch all the pages to get their IDs
  const pages = await prisma.page.findMany({
    where: {
      slug: {
        in: defaultMenuItems.map(item => item.pageSlug),
      },
    },
    select: {
      id: true,
      slug: true,
      title: true,
    },
  });

  // Create a map for easy lookup
  const pageMap = new Map(pages.map(p => [p.slug, p]));

  // Check if all required pages exist
  const missingPages = defaultMenuItems
    .map(item => item.pageSlug)
    .filter(slug => !pageMap.has(slug));

  if (missingPages.length > 0) {
    console.error('❌ ERROR: Required pages not found in database:');
    missingPages.forEach(slug => console.error(`   - ${slug}`));
    console.error('\n⚠️  Please run "npm run tsx scripts/seed-default-pages.ts" first!\n');
    process.exit(1);
  }

  let createdCount = 0;
  let updatedCount = 0;

  for (const menuItem of defaultMenuItems) {
    const page = pageMap.get(menuItem.pageSlug);
    
    if (!page) {
      console.error(`❌ Skipping ${menuItem.label} - page not found`);
      continue;
    }

    try {
      // Check if menu item already exists with this label
      const existing = await prisma.menuItem.findFirst({
        where: {
          label: menuItem.label,
          parentId: null, // Only check top-level items
        },
      });

      if (existing) {
        // Update existing menu item
        await prisma.menuItem.update({
          where: { id: existing.id },
          data: {
            pageId: page.id,
            position: menuItem.position,
            visible: true,
            openNewTab: false,
            externalUrl: null,
            isPermanent: menuItem.isPermanent,
          },
        });
        updatedCount++;
        console.log(`♻️  Updated menu item: ${menuItem.label} → ${page.title}`);
      } else {
        // Create new menu item
        await prisma.menuItem.create({
          data: {
            label: menuItem.label,
            pageId: page.id,
            position: menuItem.position,
            visible: true,
            openNewTab: false,
            parentId: null,
            externalUrl: null,
            isPermanent: menuItem.isPermanent,
          },
        });
        createdCount++;
        console.log(`✅ Created menu item: ${menuItem.label} → ${page.title}`);
      }
    } catch (error) {
      console.error(`❌ Error processing menu item "${menuItem.label}":`, error);
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   Created: ${createdCount} menu item(s)`);
  console.log(`   Updated: ${updatedCount} menu item(s)`);
  console.log(`   Total: ${defaultMenuItems.length} menu item(s)\n`);
  console.log('✨ Default menu items seeding complete!');
  console.log('📝 Menu items are now visible in Admin Panel → Menu Items\n');
}

main()
  .catch((error) => {
    console.error('❌ Fatal error during seeding:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

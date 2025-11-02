import { prisma } from '../src/lib/prisma';

/**
 * Verify Permanent Pages and Menu Items
 * 
 * This script verifies that:
 * 1. Home page is marked as permanent
 * 2. Home menu item is marked as permanent
 * 3. All required pages and menu items exist
 */

async function main() {
  console.log('🔍 Verifying Permanent Pages and Menu Items...\n');

  // Check all pages
  const pages = await prisma.page.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      isPermanent: true,
      published: true,
    },
    orderBy: { slug: 'asc' },
  });

  console.log('📄 Pages:');
  console.log('─────────────────────────────────────────────');
  pages.forEach(page => {
    const permanentFlag = page.isPermanent ? '🔒 PERMANENT' : '✏️  Editable';
    const publishedFlag = page.published ? '✅ Published' : '📝 Draft';
    console.log(`  ${page.title.padEnd(20)} (/${page.slug})`.padEnd(40) + `${permanentFlag}  ${publishedFlag}`);
  });
  console.log();

  // Check all menu items
  const menuItems = await prisma.menuItem.findMany({
    include: {
      page: {
        select: {
          title: true,
          slug: true,
        },
      },
    },
    orderBy: { position: 'asc' },
  });

  console.log('🔗 Menu Items:');
  console.log('─────────────────────────────────────────────');
  menuItems.forEach(item => {
    const permanentFlag = item.isPermanent ? '🔒 PERMANENT' : '✏️  Editable';
    const visibleFlag = item.visible ? '👁️  Visible' : '🙈 Hidden';
    const pageName = item.page ? `→ ${item.page.title}` : item.externalUrl ? `→ ${item.externalUrl}` : '(No Link)';
    console.log(`  ${item.label.padEnd(20)}`.padEnd(25) + `${pageName.padEnd(30)} ${permanentFlag}  ${visibleFlag}`);
  });
  console.log();

  // Summary
  const permanentPages = pages.filter(p => p.isPermanent).length;
  const permanentMenuItems = menuItems.filter(m => m.isPermanent).length;

  console.log('📊 Summary:');
  console.log('─────────────────────────────────────────────');
  console.log(`  Total Pages: ${pages.length} (${permanentPages} permanent)`);
  console.log(`  Total Menu Items: ${menuItems.length} (${permanentMenuItems} permanent)`);
  console.log();

  // Warnings
  const homePagePermanent = pages.find(p => p.slug === 'home')?.isPermanent;
  const homeMenuPermanent = menuItems.find(m => m.label === 'HOME')?.isPermanent;

  if (!homePagePermanent || !homeMenuPermanent) {
    console.log('⚠️  WARNINGS:');
    if (!homePagePermanent) {
      console.log('  ⚠️  Home page is NOT marked as permanent!');
    }
    if (!homeMenuPermanent) {
      console.log('  ⚠️  HOME menu item is NOT marked as permanent!');
    }
    console.log();
  } else {
    console.log('✅ All system pages and menu items are properly configured!\n');
  }
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

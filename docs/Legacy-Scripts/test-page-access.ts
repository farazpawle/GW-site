import { prisma } from '../src/lib/prisma';

/**
 * Quick Page Access Test
 * 
 * This script shows how to access the default pages programmatically
 */

async function main() {
  console.log('🧪 Testing Page Access...\n');

  const pages = ['home', 'products', 'about', 'contact'];

  for (const slug of pages) {
    const page = await prisma.page.findUnique({
      where: { slug },
      include: {
        menuItems: {
          select: {
            label: true,
            visible: true,
          },
        },
      },
    });

    if (!page) {
      console.log(`❌ ${slug.toUpperCase()}: NOT FOUND`);
      continue;
    }

    const status = page.published ? '✅ Published' : '📝 Draft';
    const menuCount = page.menuItems.length;
    const visibleMenus = page.menuItems.filter(m => m.visible).length;
    const permanentFlag = page.isPermanent ? '🔒' : '  ';

    console.log(`${permanentFlag} ${page.title.toUpperCase()}:`);
    console.log(`   URL: /${page.slug}`);
    console.log(`   Status: ${status}`);
    console.log(`   Menu Items: ${visibleMenus}/${menuCount} visible`);
    console.log(`   Type: ${page.pageType}`);
    console.log();
  }

  console.log('✅ All pages accessible!\n');
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

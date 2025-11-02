import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixPages() {
  try {
    console.log('\n=== FIXING PAGES ===\n');

    // Update Home page
    await prisma.page.update({
      where: { slug: 'home' },
      data: {
        groupType: 'all',
        groupValues: {},
        layout: 'grid',
        sortBy: 'createdAt',
        itemsPerPage: 12,
      },
    });
    console.log('✅ Fixed Home page');

    // Update Products page
    await prisma.page.update({
      where: { slug: 'products' },
      data: {
        groupType: 'all',
        groupValues: {},
        layout: 'grid',
        sortBy: 'name',
        itemsPerPage: 24,
      },
    });
    console.log('✅ Fixed Products page');

    // Update About page
    await prisma.page.update({
      where: { slug: 'about' },
      data: {
        description: 'Learn more about us',
        groupType: 'all',
        groupValues: {},
        layout: 'grid',
        sortBy: 'createdAt',
        itemsPerPage: 12,
      },
    });
    console.log('✅ Fixed About Us page');

    // Update Contact page
    await prisma.page.update({
      where: { slug: 'contact' },
      data: {
        description: 'Get in touch with us',
        groupType: 'all',
        groupValues: {},
        layout: 'grid',
        sortBy: 'createdAt',
        itemsPerPage: 12,
      },
    });
    console.log('✅ Fixed Contact Us page');

    console.log('\n✅ All pages fixed successfully!\n');
  } catch (error) {
    console.error('❌ Error fixing pages:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPages();

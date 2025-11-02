import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPages() {
  try {
    const pages = await prisma.page.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        published: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    console.log('\n=== PAGES IN DATABASE ===');
    console.log(`Total pages: ${pages.length}\n`);
    
    pages.forEach(page => {
      console.log(`Title: ${page.title}`);
      console.log(`Slug: ${page.slug}`);
      console.log(`ID: ${page.id}`);
      console.log(`Published: ${page.published}`);
      console.log(`Created: ${page.createdAt}`);
      console.log('---');
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPages();

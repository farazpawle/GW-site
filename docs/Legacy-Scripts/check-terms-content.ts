import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkContent() {
  try {
    const page = await prisma.page.findUnique({
      where: { slug: 'terms' },
      select: { content: true }
    });
    
    if (page && page.content) {
      console.log('First 500 characters of Terms content:');
      console.log('=====================================');
      console.log(page.content.substring(0, 500));
      console.log('\n...\n');
      console.log('Last 200 characters:');
      console.log('====================');
      console.log(page.content.substring(page.content.length - 200));
    } else {
      console.log('No content found!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkContent();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPages() {
  try {
    const pages = await prisma.page.findMany({
      where: { slug: { in: ['privacy', 'terms'] } },
      select: { 
        id: true, 
        slug: true, 
        title: true, 
        published: true, 
        isPermanent: true,
        content: true 
      }
    });
    
    console.log(' Legal Pages in Database:');
    console.log('===========================');
    pages.forEach(page => {
      console.log(`\n ${page.title}`);
      console.log(`  - Slug: ${page.slug}`);
      console.log(`  - Published: ${page.published}`);
      console.log(`  - Permanent: ${page.isPermanent}`);
      console.log(`  - Content Length: ${page.content?.length || 0} characters`);
      console.log(`  - ID: ${page.id}`);
    });
    
    if (pages.length === 2) {
      console.log('\n Both Privacy Policy and Terms of Service pages found!');
      console.log('\n Access URLs:');
      console.log('   - Privacy Policy: http://localhost:3000/privacy');
      console.log('   - Terms of Service: http://localhost:3000/terms');
      console.log('\n Admin Panel:');
      console.log('   - Edit pages at: http://localhost:3000/admin/pages');
    } else {
      console.log('\n Missing pages!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPages();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugTermsPage() {
  try {
    console.log('Fetching Terms page data as the component would...\n');
    
    const page = await prisma.page.findUnique({
      where: { slug: 'terms', published: true },
      select: { title: true, content: true, description: true },
    });
    
    if (!page) {
      console.log(' Page not found or not published!');
      return;
    }
    
    console.log(' Page found!');
    console.log('=====================================\n');
    
    console.log('Title:', page.title);
    console.log('Description:', page.description || '(none)');
    console.log('Content length:', page.content?.length || 0, 'characters');
    console.log('Content is null?', page.content === null);
    console.log('Content is empty string?', page.content === '');
    
    if (page.content) {
      console.log('\nFirst 1000 characters of content:');
      console.log('-----------------------------------');
      console.log(page.content.substring(0, 1000));
      
      // Check for common HTML tags
      console.log('\n\nHTML Structure Check:');
      console.log('-----------------------------------');
      console.log('Contains <h2>:', page.content.includes('<h2>'));
      console.log('Contains <h3>:', page.content.includes('<h3>'));
      console.log('Contains <p>:', page.content.includes('<p>'));
      console.log('Contains <ul>:', page.content.includes('<ul>'));
      console.log('Contains <li>:', page.content.includes('<li>'));
    }
    
  } catch (error) {
    console.error(' Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugTermsPage();

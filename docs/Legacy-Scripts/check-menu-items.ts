import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMenuItems() {
  try {
    console.log('\n=== CHECKING MENU ITEMS ===\n');
    
    const menuItems = await prisma.menuItem.findMany({
      include: {
        page: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: {
        position: 'asc',
      },
    });

    menuItems.forEach(item => {
      console.log(`Label: ${item.label}`);
      console.log(`Position: ${item.position}`);
      console.log(`Page ID: ${item.pageId || 'NULL'}`);
      console.log(`External URL: ${item.externalUrl || 'NULL'}`);
      if (item.page) {
        console.log(`Linked Page: ${item.page.title} (slug: ${item.page.slug})`);
      } else {
        console.log(`Linked Page: NONE`);
      }
      console.log('---');
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMenuItems();

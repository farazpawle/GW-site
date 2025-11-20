import { prisma } from '@/lib/prisma';

async function main() {
  const pages = await prisma.page.findMany({
    where: { slug: { in: ['privacy', 'terms'] } },
    select: { slug: true, title: true, published: true, isPermanent: true },
  });

  if (pages.length === 0) {
    console.log('No legal pages found.');
  } else {
    console.log('Legal pages:');
    for (const page of pages) {
      console.log(page);
    }
  }
}

main()
  .catch((error) => {
    console.error('Error checking legal pages:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

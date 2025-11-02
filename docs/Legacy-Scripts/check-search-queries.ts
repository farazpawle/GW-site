import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🔍 Checking SearchQuery table...\n');

  // Get all search queries
  const allQueries = await prisma.searchQuery.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    take: 20,
  });

  console.log(`📊 Total search queries in database: ${allQueries.length}\n`);

  if (allQueries.length > 0) {
    console.log('Recent searches:');
    allQueries.forEach((query, index) => {
      console.log(`\n${index + 1}. Query: "${query.query}"`);
      console.log(`   User ID: ${query.userId || 'null (Guest)'}`);
      console.log(`   Results: ${query.resultsCount}`);
      console.log(`   Created: ${query.createdAt.toLocaleString()}`);
    });
  } else {
    console.log('No search queries found in database.');
  }

  // Count queries with null userId
  const guestQueries = await prisma.searchQuery.count({
    where: {
      userId: null,
    },
  });

  // Count queries with userId
  const authenticatedQueries = await prisma.searchQuery.count({
    where: {
      userId: { not: null },
    },
  });

  console.log('\n📈 Statistics:');
  console.log(`   Guest searches (userId = null): ${guestQueries}`);
  console.log(`   Authenticated searches: ${authenticatedQueries}`);
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

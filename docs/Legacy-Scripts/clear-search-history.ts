import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🧹 Cleaning up old search queries...\n');

  // Count current queries
  const currentCount = await prisma.searchQuery.count();
  console.log(`📊 Current search queries in database: ${currentCount}`);

  if (currentCount === 0) {
    console.log('✅ Database is already clean!');
    return;
  }

  // Delete all search queries
  const result = await prisma.searchQuery.deleteMany({});
  console.log(`\n✅ Deleted ${result.count} search queries`);

  // Also clear search analytics
  const analyticsResult = await prisma.searchAnalytics.deleteMany({});
  console.log(`✅ Deleted ${analyticsResult.count} search analytics records`);

  console.log('\n🎉 Database cleaned successfully!');
  console.log('ℹ️  You can now test with fresh searches.');
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

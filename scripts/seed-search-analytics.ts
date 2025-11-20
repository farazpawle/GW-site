import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed script for search analytics data
 * Creates realistic search terms with varying frequencies
 */

async function main() {
  console.log('🔍 Seeding search analytics data...\n');

  // Define realistic automotive search terms with different popularity levels
  const searchTerms = [
    // High frequency searches (50-200 searches)
    { term: 'brake pads', count: 187 },
    { term: 'engine oil filter', count: 165 },
    { term: 'air filter', count: 154 },
    { term: 'spark plugs', count: 142 },
    { term: 'battery', count: 138 },
    { term: 'alternator', count: 125 },
    { term: 'water pump', count: 118 },
    { term: 'timing belt', count: 112 },
    
    // Medium frequency searches (30-50 searches)
    { term: 'radiator', count: 95 },
    { term: 'fuel pump', count: 88 },
    { term: 'starter motor', count: 82 },
    { term: 'brake disc', count: 76 },
    { term: 'suspension parts', count: 71 },
    { term: 'shock absorber', count: 68 },
    { term: 'clutch kit', count: 64 },
    { term: 'exhaust system', count: 59 },
    { term: 'transmission parts', count: 55 },
    { term: 'cooling fan', count: 51 },
    
    // Lower frequency searches (10-30 searches)
    { term: 'headlight assembly', count: 47 },
    { term: 'wiper blades', count: 43 },
    { term: 'turbocharger', count: 39 },
    { term: 'fuel injector', count: 36 },
    { term: 'oxygen sensor', count: 33 },
    { term: 'catalytic converter', count: 29 },
    { term: 'power steering pump', count: 26 },
    { term: 'cv joint', count: 23 },
    { term: 'wheel bearing', count: 21 },
    { term: 'ignition coil', count: 19 },
    
    // Rare searches (5-10 searches)
    { term: 'throttle body', count: 16 },
    { term: 'egr valve', count: 14 },
    { term: 'camshaft sensor', count: 12 },
    { term: 'mass airflow sensor', count: 11 },
    { term: 'idle control valve', count: 9 },
    { term: 'abs module', count: 8 },
    { term: 'turbo manifold', count: 7 },
    { term: 'differential parts', count: 6 },
  ];

  let inserted = 0;
  let updated = 0;

  for (const { term, count } of searchTerms) {
    const lastSearched = new Date(
      Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
    );

    const result = await prisma.searchAnalytics.upsert({
      where: { term },
      update: {
        count,
        lastSearched,
      },
      create: {
        term,
        count,
        lastSearched,
      },
    });

    if (result) {
      // Check if it was created or updated by attempting to find a previous record
      const isNew = result.count === count;
      if (isNew) {
        inserted++;
      } else {
        updated++;
      }
    }
  }

  console.log('✅ Search analytics data seeded successfully!\n');
  console.log(`📊 Summary:`);
  console.log(`   Total Terms: ${searchTerms.length}`);
  console.log(`   Inserted: ${inserted}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Total Searches: ${searchTerms.reduce((sum, s) => sum + s.count, 0).toLocaleString()}`);
  console.log(`\n🔥 Top 5 Searches:`);
  
  const topFive = searchTerms
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  topFive.forEach((s, i) => {
    console.log(`   ${i + 1}. ${s.term} - ${s.count} searches`);
  });
}

main()
  .catch((error) => {
    console.error('❌ Error seeding search analytics:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

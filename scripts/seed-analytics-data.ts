import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPageAnalytics() {
  console.log('🌱 Seeding Page Analytics data...');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const analyticsData = [];

  // Generate 90 days of data
  for (let i = 90; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Generate realistic engagement metrics
    // Weekends have less traffic than weekdays
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const weekendMultiplier = isWeekend ? 0.6 : 1.0;

    // Add some randomness and trending growth over time
    const growthFactor = 1 + (90 - i) / 300; // Gradual growth over 90 days
    const randomVariation = 0.8 + Math.random() * 0.4; // 80%-120% variation

    const basePageViews = Math.floor(800 * weekendMultiplier * growthFactor * randomVariation);
    const baseProductViews = Math.floor(450 * weekendMultiplier * growthFactor * randomVariation);
    const baseInquiries = Math.floor(8 * weekendMultiplier * growthFactor * randomVariation);

    analyticsData.push({
      date,
      pageViews: basePageViews,
      productViews: baseProductViews,
      categoryViews: Math.floor(basePageViews * 0.15), // 15% of page views
      inquiries: baseInquiries,
      quoteRequests: Math.floor(baseInquiries * 0.6), // 60% of inquiries are quote requests
      newProducts: i % 7 === 0 ? Math.floor(Math.random() * 3) + 1 : 0, // New products ~once a week
      updatedProducts: Math.floor(Math.random() * 2), // 0-1 updates per day
    });
  }

  // Insert data using createMany
  console.log(`📊 Inserting ${analyticsData.length} days of analytics data...`);

  try {
    await prisma.pageAnalytics.createMany({
      data: analyticsData,
      skipDuplicates: true, // Skip if date already exists
    });

    console.log('✅ Page Analytics data seeded successfully!');

    // Show summary
    const summary = analyticsData.reduce(
      (acc, item) => ({
        totalPageViews: acc.totalPageViews + item.pageViews,
        totalProductViews: acc.totalProductViews + item.productViews,
        totalInquiries: acc.totalInquiries + item.inquiries,
        totalQuoteRequests: acc.totalQuoteRequests + item.quoteRequests,
      }),
      {
        totalPageViews: 0,
        totalProductViews: 0,
        totalInquiries: 0,
        totalQuoteRequests: 0,
      }
    );

    console.log('\n📈 Summary (90 days):');
    console.log(`   Total Page Views: ${summary.totalPageViews.toLocaleString()}`);
    console.log(`   Total Product Views: ${summary.totalProductViews.toLocaleString()}`);
    console.log(`   Total Inquiries: ${summary.totalInquiries.toLocaleString()}`);
    console.log(`   Total Quote Requests: ${summary.totalQuoteRequests.toLocaleString()}`);
    console.log(`   Avg Daily Page Views: ${Math.floor(summary.totalPageViews / 90).toLocaleString()}`);
    console.log(
      `   Avg Daily Product Views: ${Math.floor(summary.totalProductViews / 90).toLocaleString()}`
    );
  } catch (error) {
    console.error('❌ Error seeding analytics data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  seedPageAnalytics()
    .then(() => {
      console.log('\n✅ Seeding complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export default seedPageAnalytics;

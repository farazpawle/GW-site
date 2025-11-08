import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Aggregates daily engagement metrics for the previous day
 * This script should be run daily via cron job (e.g., at midnight)
 * 
 * Cron setup examples:
 * - Linux/Mac: 0 0 * * * cd /path/to/project && npm run aggregate:engagement
 * - Windows Task Scheduler: Run daily at 00:00
 */
async function aggregateEngagement() {
  try {
    console.log('📊 Starting daily engagement aggregation...');

    // Calculate date for yesterday (we aggregate previous day's data)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const dayEnd = new Date(yesterday);
    dayEnd.setHours(23, 59, 59, 999);

    console.log(`📅 Aggregating data for: ${yesterday.toISOString().split('T')[0]}`);

    // Check if analytics for this date already exist
    const existing = await prisma.pageAnalytics.findUnique({
      where: { date: yesterday },
    });

    if (existing) {
      console.log('⚠️  Analytics for this date already exist. Updating...');
    }

    // Aggregate metrics for the day
    // In production, these would come from actual analytics tracking
    // For now, we'll use database counts as approximations

    const [
      newProductsCount,
      updatedProductsCount,
      inquiriesCount,
      quoteRequestsCount,
    ] = await Promise.all([
      // Count products created yesterday
      prisma.part.count({
        where: {
          createdAt: {
            gte: yesterday,
            lte: dayEnd,
          },
        },
      }),

      // Count products updated yesterday
      prisma.part.count({
        where: {
          updatedAt: {
            gte: yesterday,
            lte: dayEnd,
          },
          createdAt: {
            lt: yesterday, // Exclude newly created products
          },
        },
      }),

      // Count inquiries received yesterday
      prisma.contactMessage.count({
        where: {
          createdAt: {
            gte: yesterday,
            lte: dayEnd,
          },
        },
      }),

      // Count quote requests received yesterday
      prisma.quoteRequest.count({
        where: {
          createdAt: {
            gte: yesterday,
            lte: dayEnd,
          },
        },
      }),
    ]);

    // In production, pageViews, productViews, and categoryViews would come from:
    // - Google Analytics API
    // - Custom analytics tracking middleware
    // - Server logs analysis
    // - CDN analytics (Cloudflare, etc.)
    
    // For now, we'll use placeholder values
    // TODO: Integrate with actual analytics tracking system
    const pageViews = 0; // Replace with actual tracking
    const productViews = 0; // Replace with actual tracking
    const categoryViews = 0; // Replace with actual tracking

    // Upsert analytics data
    const analytics = await prisma.pageAnalytics.upsert({
      where: { date: yesterday },
      update: {
        newProducts: newProductsCount,
        updatedProducts: updatedProductsCount,
        inquiries: inquiriesCount,
        quoteRequests: quoteRequestsCount,
        // Only update page views if we have actual tracking
        ...(pageViews > 0 && { pageViews }),
        ...(productViews > 0 && { productViews }),
        ...(categoryViews > 0 && { categoryViews }),
      },
      create: {
        date: yesterday,
        pageViews,
        productViews,
        categoryViews,
        inquiries: inquiriesCount,
        quoteRequests: quoteRequestsCount,
        newProducts: newProductsCount,
        updatedProducts: updatedProductsCount,
      },
    });

    console.log('✅ Aggregation complete!');
    console.log('\n📈 Daily Summary:');
    console.log(`   New Products: ${analytics.newProducts}`);
    console.log(`   Updated Products: ${analytics.updatedProducts}`);
    console.log(`   Inquiries: ${analytics.inquiries}`);
    console.log(`   Quote Requests: ${analytics.quoteRequests}`);
    console.log(`   Page Views: ${analytics.pageViews} ${pageViews === 0 ? '(not tracked)' : ''}`);
    console.log(`   Product Views: ${analytics.productViews} ${productViews === 0 ? '(not tracked)' : ''}`);
    console.log(`   Category Views: ${analytics.categoryViews} ${categoryViews === 0 ? '(not tracked)' : ''}`);

    return analytics;
  } catch (error) {
    console.error('❌ Error aggregating engagement data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  aggregateEngagement()
    .then(() => {
      console.log('\n✅ Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export default aggregateEngagement;

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const admin = await checkAdmin();
    
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get('range') || '30d';

    // Calculate date range
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    switch (range) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // Fetch analytics data
    const analytics = await prisma.pageAnalytics.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Transform data for chart
    const chartData = analytics.map((item) => ({
      date: item.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      pageViews: item.pageViews,
      productViews: item.productViews,
      quoteRequests: item.quoteRequests,
      categoryViews: item.categoryViews,
      newProducts: item.newProducts,
      updatedProducts: item.updatedProducts,
    }));

    // Calculate totals
    const totals = {
      pageViews: analytics.reduce((sum, item) => sum + item.pageViews, 0),
      productViews: analytics.reduce((sum, item) => sum + item.productViews, 0),
      quoteRequests: analytics.reduce((sum, item) => sum + item.quoteRequests, 0),
      categoryViews: analytics.reduce((sum, item) => sum + item.categoryViews, 0),
      newProducts: analytics.reduce((sum, item) => sum + item.newProducts, 0),
      updatedProducts: analytics.reduce((sum, item) => sum + item.updatedProducts, 0),
    };

    return NextResponse.json({
      success: true,
      data: chartData,
      totals,
      range,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  } catch (error: unknown) {
    console.error('Error fetching engagement analytics:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

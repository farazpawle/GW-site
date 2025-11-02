import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from '@/lib/auth';

/**
 * GET /api/search/analytics
 * Admin-only endpoint for search analytics
 */
export async function GET() {
  try {
    // Check admin authorization
    const user = await checkAdmin();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }
    
    // Get top 20 most searched terms
    const topSearchesRaw = await prisma.searchAnalytics.findMany({
      orderBy: {
        count: 'desc',
      },
      take: 20,
      select: {
        term: true,
        count: true,
        lastSearched: true,
      },
    });
    const topSearches = topSearchesRaw.map((search) => ({
      term: search.term,
      count: Number(search.count),
      lastSearched: search.lastSearched.toISOString(),
    }));
    
    // Get total search count
    const totalSearches = await prisma.searchQuery.count();
    
    // Get unique users who searched
    const uniqueUsers = await prisma.searchQuery.groupBy({
      by: ['userId'],
      where: {
        userId: { not: null },
      },
    });
    
    // Calculate average results per search
    const avgResults = await prisma.searchQuery.aggregate({
      _avg: {
        resultsCount: true,
      },
    });
    const averageResults = avgResults._avg.resultsCount
      ? Number(avgResults._avg.resultsCount)
      : 0;
    
    return NextResponse.json({
      topSearches,
      stats: {
        totalSearches,
        uniqueUsers: uniqueUsers.length,
        averageResults,
        topSearchesCount: topSearches.length,
      },
    });
  } catch (error) {
    console.error('Search analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search analytics' },
      { status: 500 }
    );
  }
}

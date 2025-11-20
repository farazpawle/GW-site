import { NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/messages/dashboard
 * 
 * Get aggregated message statistics and recent unread messages for the dashboard
 * 
 * @returns Dashboard data including:
 * - stats: total, unread, read, replied counts, response rate, average response time, today count, week trend
 * - recentUnread: Last 5 unread messages
 */
export async function GET() {
  try {
    // Ensure user is an admin
    const user = await checkAdmin();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Calculate date ranges
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Execute parallel queries for efficiency
    const [
      totalCount,
      unreadCount,
      readCount,
      repliedCount,
      todayCount,
      recentUnread,
      repliedMessages,
      weekMessages
    ] = await Promise.all([
      // Total messages count
      prisma.contactMessage.count(),

      // Unread messages count
      prisma.contactMessage.count({ where: { status: 'UNREAD' } }),

      // Read messages count
      prisma.contactMessage.count({ where: { status: 'READ' } }),

      // Replied messages count
      prisma.contactMessage.count({ where: { status: 'REPLIED' } }),

      // Today's messages count
      prisma.contactMessage.count({
        where: {
          createdAt: { gte: todayStart }
        }
      }),

      // Recent 5 unread messages
      prisma.contactMessage.findMany({
        where: { status: 'UNREAD' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          subject: true,
          message: true,
          status: true,
          createdAt: true
        }
      }),

      // Get replied messages with their creation and reply dates for response time calculation
      prisma.$queryRaw`
        SELECT "createdAt", "repliedAt" 
        FROM contact_messages 
        WHERE status = 'REPLIED' 
          AND "createdAt" >= ${weekAgo}
          AND "repliedAt" IS NOT NULL
        LIMIT 100
      ` as Promise<Array<{ createdAt: Date; repliedAt: Date | null }>>,

      // Messages from last 7 days for trend chart
      prisma.contactMessage.findMany({
        where: {
          createdAt: { gte: weekAgo }
        },
        select: {
          createdAt: true
        }
      })
    ]);

    // Calculate response rate (using repliedCount, not totalProcessed)
    const responseRate = totalCount > 0 ? (repliedCount / totalCount) * 100 : 0;

    // Calculate average response time using actual repliedAt timestamps
    let averageResponseTime = 0;
    if (repliedMessages.length > 0) {
      // Calculate actual time between creation and reply
      const validResponseTimes = repliedMessages
        .filter(msg => msg.repliedAt !== null)
        .map(msg => {
          const createdTime = new Date(msg.createdAt).getTime();
          const repliedTime = new Date(msg.repliedAt!).getTime();
          return (repliedTime - createdTime) / (1000 * 60 * 60); // Convert to hours
        });
      
      if (validResponseTimes.length > 0) {
        const totalResponseTime = validResponseTimes.reduce((acc: number, time: number) => acc + time, 0);
        averageResponseTime = totalResponseTime / validResponseTimes.length;
      }
    }

    // Calculate week trend (messages per day for last 7 days)
    const weekTrend: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const dayCount = weekMessages.filter(msg => {
        const msgDate = new Date(msg.createdAt);
        return msgDate >= dayStart && msgDate < dayEnd;
      }).length;
      
      weekTrend.push(dayCount);
    }

    // Prepare response data
    const dashboardData = {
      stats: {
        total: totalCount,
        unread: unreadCount,
        read: readCount,
        replied: repliedCount,
        responseRate: Math.round(responseRate * 10) / 10, // Round to 1 decimal
        averageResponseTime: Math.round(averageResponseTime * 10) / 10, // Round to 1 decimal
        todayCount,
        weekTrend
      },
      recentUnread: recentUnread.map(msg => ({
        ...msg,
        createdAt: msg.createdAt.toISOString()
      }))
    };

    return NextResponse.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Error fetching message dashboard data:', error);
    
    // Check if it's an authentication error
    if (error instanceof Error && error.message.includes('Admin access required')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch message dashboard data' },
      { status: 500 }
    );
  }
}

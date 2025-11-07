import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin, checkPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { MessageStatus, Prisma } from '@prisma/client';

/**
 * GET /api/admin/messages
 * 
 * List all contact messages with search, filter, and pagination
 * 
 * Query Parameters:
 * - search: Search by name, email, or subject (case-insensitive)
 * - status: Filter by status (UNREAD, READ, REPLIED, or 'all')
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20)
 * 
 * @returns Message list with pagination metadata and statistics
 */
export async function GET(req: NextRequest) {
  try {
    // Ensure user is an admin
    const user = await checkPermission('messages.view');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Extract query parameters
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const statusFilter = searchParams.get('status') || 'all';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));

    // Build where clause
    const where: Prisma.ContactMessageWhereInput = {};

    // Add search filter (name, email, or subject)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Add status filter
    if (statusFilter !== 'all' && (statusFilter === 'UNREAD' || statusFilter === 'READ' || statusFilter === 'REPLIED')) {
      where.status = statusFilter as MessageStatus;
    }

    // Execute parallel queries for messages, count, and stats
    const [messages, total, statsData] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          subject: true,
          message: true,
          status: true,
          createdAt: true
        }
      }),
      prisma.contactMessage.count({ where }),
      prisma.contactMessage.groupBy({
        by: ['status'],
        _count: {
          status: true
        }
      })
    ]);

    // Format statistics
    const stats = {
      total: await prisma.contactMessage.count(),
      unread: statsData.find(s => s.status === 'UNREAD')?._count.status || 0,
      read: statsData.find(s => s.status === 'READ')?._count.status || 0,
      replied: statsData.find(s => s.status === 'REPLIED')?._count.status || 0
    };

    // Calculate pagination metadata
    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        messages,
        pagination: {
          total,
          page,
          limit,
          pages
        },
        stats
      }
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch messages' 
      },
      { status: 500 }
    );
  }
}

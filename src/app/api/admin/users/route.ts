import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserRole, Prisma } from '@prisma/client';
import { requirePermission, filterManageableUsers } from '@/lib/rbac';

/**
 * GET /api/admin/users
 * 
 * List all users with search, filter, and pagination
 * RBAC: Requires 'users.view' permission
 * Only shows users that current user can manage (based on role hierarchy)
 * 
 * Query Parameters:
 * - search: Search by name or email (case-insensitive)
 * - role: Filter by role
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20)
 * 
 * @returns User list with pagination metadata
 */
export async function GET(req: NextRequest) {
  try {
    // RBAC: Require users.view permission
    const userOrError = await requirePermission('users.view');
    if (userOrError instanceof NextResponse) return userOrError;
    
    const currentUser = userOrError;

    // Extract query parameters
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const roleFilter = searchParams.get('role') as UserRole | null;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));

    // Build where clause
    const where: Prisma.UserWhereInput = {};

    // Add search filter (name or email)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Add role filter
    if (roleFilter && (roleFilter === 'ADMIN' || roleFilter === 'VIEWER')) {
      where.role = roleFilter;
    }

    // Execute parallel queries for users and count
    const [allUsers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.user.count({ where })
    ]);

    // RBAC: Filter users based on role hierarchy
    // Lower roles cannot see higher roles
    // @ts-ignore - roleLevel exists at runtime after migration
    const users = filterManageableUsers(currentUser, allUsers);

    // Calculate pagination metadata
    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          total: users.length, // Show filtered count
          page,
          limit,
          pages
        }
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch users' 
      },
      { status: 500 }
    );
  }
}

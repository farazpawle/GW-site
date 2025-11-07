/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * API Route Guards
 * 
 * Middleware functions to protect API routes with permission checks.
 * Use these in your API route handlers to enforce RBAC.
 */

import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { hasPermission, hasAnyPermission, hasAllPermissions, canManageUser, type RBACUser } from './check-permission';

// ============================================================================
// TYPES
// ============================================================================

export interface AuthenticatedRequest extends NextRequest {
  user?: RBACUser;
}

// ============================================================================
// USER FETCHING
// ============================================================================

/**
 * Get current authenticated user with RBAC fields
 * Returns null if not authenticated
 */
export async function getCurrentRBACUser(): Promise<RBACUser | null> {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser || !clerkUser.emailAddresses?.[0]) {
      return null;
    }

    const email = clerkUser.emailAddresses[0].emailAddress;
    
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      roleLevel: (user as any).roleLevel || 10,
      permissions: (user as any).permissions || [],
    };
  } catch (error) {
    console.error('Error fetching RBAC user:', error);
    return null;
  }
}

// ============================================================================
// PERMISSION GUARDS
// ============================================================================

/**
 * Require a specific permission to access the route
 * Returns 401 if not authenticated, 403 if no permission
 * 
 * @param requiredPermission - Permission string (e.g., "products.view")
 * @returns Promise<RBACUser | NextResponse> - User if authorized, error response if not
 * 
 * @example
 * export async function GET() {
 *   const userOrError = await requirePermission('products.view');
 *   if (userOrError instanceof NextResponse) return userOrError;
 *   
 *   // User is authorized, continue with route logic
 *   const user = userOrError;
 * }
 */
export async function requirePermission(requiredPermission: string): Promise<RBACUser | NextResponse> {
  const user = await getCurrentRBACUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }

  if (!hasPermission(user, requiredPermission)) {
    return NextResponse.json(
      {
        error: 'Forbidden',
        message: `Missing required permission: ${requiredPermission}`,
      },
      { status: 403 }
    );
  }

  return user;
}

/**
 * Require ANY of the specified permissions (OR logic)
 * User needs at least one of the permissions
 * 
 * @param requiredPermissions - Array of permission strings
 * @returns Promise<RBACUser | NextResponse>
 * 
 * @example
 * export async function GET() {
 *   const userOrError = await requireAnyPermission(['products.view', 'products.edit']);
 *   if (userOrError instanceof NextResponse) return userOrError;
 *   
 *   const user = userOrError;
 * }
 */
export async function requireAnyPermission(requiredPermissions: string[]): Promise<RBACUser | NextResponse> {
  const user = await getCurrentRBACUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }

  if (!hasAnyPermission(user, requiredPermissions)) {
    return NextResponse.json(
      {
        error: 'Forbidden',
        message: `Missing required permissions. Need one of: ${requiredPermissions.join(', ')}`,
      },
      { status: 403 }
    );
  }

  return user;
}

/**
 * Require ALL of the specified permissions (AND logic)
 * User needs every permission in the list
 * 
 * @param requiredPermissions - Array of permission strings
 * @returns Promise<RBACUser | NextResponse>
 * 
 * @example
 * export async function POST() {
 *   const userOrError = await requireAllPermissions(['products.create', 'categories.view']);
 *   if (userOrError instanceof NextResponse) return userOrError;
 *   
 *   const user = userOrError;
 * }
 */
export async function requireAllPermissions(requiredPermissions: string[]): Promise<RBACUser | NextResponse> {
  const user = await getCurrentRBACUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }

  if (!hasAllPermissions(user, requiredPermissions)) {
    return NextResponse.json(
      {
        error: 'Forbidden',
        message: `Missing required permissions: ${requiredPermissions.join(', ')}`,
      },
      { status: 403 }
    );
  }

  return user;
}

/**
 * Require ability to manage a specific target user (role hierarchy check)
 * Enforces: Lower roles cannot manage higher roles
 * 
 * @param targetUserId - ID of the user being managed
 * @returns Promise<{ currentUser: RBACUser; targetUser: RBACUser } | NextResponse>
 * 
 * @example
 * export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
 *   const result = await requireCanManageUser(params.id);
 *   if (result instanceof NextResponse) return result;
 *   
 *   const { currentUser, targetUser } = result;
 *   // currentUser can manage targetUser
 * }
 */
export async function requireCanManageUser(
  targetUserId: string
): Promise<{ currentUser: RBACUser; targetUser: RBACUser } | NextResponse> {
  const currentUser = await getCurrentRBACUser();

  if (!currentUser) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }

  // Fetch target user
  const targetUserRaw = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!targetUserRaw) {
    return NextResponse.json(
      { error: 'Not Found', message: 'Target user not found' },
      { status: 404 }
    );
  }

  const targetUser: RBACUser = {
    id: targetUserRaw.id,
    email: targetUserRaw.email,
    name: targetUserRaw.name,
    role: targetUserRaw.role,
    roleLevel: (targetUserRaw as any).roleLevel || 10,
    permissions: (targetUserRaw as any).permissions || [],
  };

  // Check hierarchy
  if (!canManageUser(currentUser, targetUser)) {
    return NextResponse.json(
      {
        error: 'Forbidden',
        message: 'Cannot manage users at same or higher role level',
      },
      { status: 403 }
    );
  }

  return { currentUser, targetUser };
}

/**
 * Require super admin role (convenience guard)
 * 
 * @returns Promise<RBACUser | NextResponse>
 * 
 * @example
 * export async function POST() {
 *   const userOrError = await requireSuperAdmin();
 *   if (userOrError instanceof NextResponse) return userOrError;
 *   
 *   const user = userOrError;
 * }
 */
export async function requireSuperAdmin(): Promise<RBACUser | NextResponse> {
  const user = await getCurrentRBACUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }

  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json(
      {
        error: 'Forbidden',
        message: 'Super Admin access required',
      },
      { status: 403 }
    );
  }

  return user;
}

/**
 * Require authenticated user (no specific permission)
 * Use when route requires authentication but permission will be checked later
 * 
 * @returns Promise<RBACUser | NextResponse>
 */
export async function requireAuth(): Promise<RBACUser | NextResponse> {
  const user = await getCurrentRBACUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }

  return user;
}

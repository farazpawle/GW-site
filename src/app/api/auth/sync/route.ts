import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/auth/sync
 * 
 * Synchronizes the currently authenticated Clerk user with the local database.
 * This is a "lazy sync" mechanism to ensure the user exists in the DB even if
 * webhooks fail (common in local development).
 * 
 * Behavior:
 * - If user missing: Creates user with default 'VIEWER' role.
 * - If user exists: Updates email and name.
 * - Does NOT modify roles for existing users.
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user details from Clerk
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);

    const primaryEmail = clerkUser.emailAddresses.find(
      (email) => email.id === clerkUser.primaryEmailAddressId
    );

    if (!primaryEmail) {
      return NextResponse.json(
        { error: 'No primary email found' },
        { status: 400 }
      );
    }

    const name = clerkUser.firstName && clerkUser.lastName 
      ? `${clerkUser.firstName} ${clerkUser.lastName}` 
      : clerkUser.firstName || clerkUser.lastName || null;

    // Upsert user in database
    // Note: We default to 'VIEWER' role on create, but DO NOT update role on existing users
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {
        email: primaryEmail.emailAddress,
        name: name,
        // Role is intentionally omitted here to preserve existing role
      },
      create: {
        id: userId,
        email: primaryEmail.emailAddress,
        name: name,
        role: 'VIEWER', // Default safe role
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('❌ [/api/auth/sync] Error syncing user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

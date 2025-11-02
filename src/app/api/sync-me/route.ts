import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { clerkClient } from '@clerk/nextjs/server';

/**
 * GET /api/sync-me
 * Syncs the currently logged-in Clerk user to the database with SUPER_ADMIN role
 */
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated. Please sign in first.' },
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
    
    // Upsert user in database with SUPER_ADMIN role
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {
        email: primaryEmail.emailAddress,
        name: clerkUser.firstName && clerkUser.lastName 
          ? `${clerkUser.firstName} ${clerkUser.lastName}` 
          : clerkUser.firstName || clerkUser.lastName || null,
        role: 'SUPER_ADMIN', // Force SUPER_ADMIN
      },
      create: {
        id: userId,
        email: primaryEmail.emailAddress,
        name: clerkUser.firstName && clerkUser.lastName 
          ? `${clerkUser.firstName} ${clerkUser.lastName}` 
          : clerkUser.firstName || clerkUser.lastName || null,
        role: 'SUPER_ADMIN', // Force SUPER_ADMIN
      },
    });
    
    return NextResponse.json({
      success: true,
      message: '✅ You are now a SUPER_ADMIN!',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role, 
      },
    });
  } catch (error) {
    console.error('Error syncing user:', error);
    return NextResponse.json(
      { error: 'Failed to sync user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import { clerkClient } from '@clerk/nextjs/server';
import { prisma } from '../src/lib/prisma';

/**
 * Clean Up Deleted Users
 * 
 * Removes users from PostgreSQL that no longer exist in Clerk.
 * Useful when users are deleted from Clerk before webhook is set up.
 * 
 * Usage: npx tsx scripts/cleanup-deleted-users.ts
 */

async function cleanupDeletedUsers() {
  try {
    console.log('🔍 Checking for deleted users...\n');
    
    // Get all users from database
    const dbUsers = await prisma.user.findMany({
      select: { id: true, email: true },
    });

    console.log(`Found ${dbUsers.length} users in database`);

    if (dbUsers.length === 0) {
      console.log('✅ No users in database to check');
      return;
    }

    // Get all users from Clerk
    const client = await clerkClient();
    const clerkUsers = await client.users.getUserList();
    const clerkUserIds = new Set(clerkUsers.data.map((u) => u.id));

    console.log(`Found ${clerkUsers.data.length} users in Clerk\n`);

    let deleted = 0;

    // Find users in database that don't exist in Clerk
    for (const dbUser of dbUsers) {
      if (!clerkUserIds.has(dbUser.id)) {
        // User exists in database but not in Clerk - delete them
        await prisma.user.delete({
          where: { id: dbUser.id },
        });

        console.log(`❌ Deleted: ${dbUser.email} (${dbUser.id})`);
        deleted++;
      } else {
        console.log(`✅ Still exists: ${dbUser.email}`);
      }
    }

    console.log('\n📊 Cleanup Summary:');
    console.log(`   ❌ Deleted: ${deleted}`);
    console.log(`   ✅ Kept: ${dbUsers.length - deleted}`);

    if (deleted > 0) {
      console.log('\n🎉 Database cleaned up successfully!');
    } else {
      console.log('\n✅ No cleanup needed - all users in sync');
    }

  } catch (error) {
    console.error('\n❌ Fatal error during cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
console.log('🧹 Starting deleted users cleanup...\n');
cleanupDeletedUsers();

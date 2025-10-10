// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import { clerkClient } from '@clerk/nextjs/server';
import { prisma } from '../src/lib/prisma';

/**
 * Sync Existing Clerk Users to PostgreSQL
 * 
 * Run this script to sync users that were created before the webhook was set up.
 * 
 * Usage: npx tsx scripts/sync-existing-users.ts
 */

async function syncExistingUsers() {
  try {
    console.log('📥 Fetching users from Clerk...');
    
    const client = await clerkClient();
    const clerkUsers = await client.users.getUserList();

    console.log(`✅ Found ${clerkUsers.data.length} users in Clerk\n`);

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const user of clerkUsers.data) {
      try {
        const primaryEmail = user.emailAddresses.find(
          (email) => email.id === user.primaryEmailAddressId
        );

        if (!primaryEmail) {
          console.log(`⚠️ Skipping user ${user.id} - no primary email`);
          skipped++;
          continue;
        }

        // Check if user already exists in database
        const existingUser = await prisma.user.findUnique({
          where: { id: user.id },
        });

        if (existingUser) {
          console.log(`ℹ️ User already exists: ${primaryEmail.emailAddress} (${user.id})`);
          skipped++;
          continue;
        }

        // Create user in database
        const newUser = await prisma.user.create({
          data: {
            id: user.id,
            email: primaryEmail.emailAddress,
            name: user.firstName && user.lastName 
              ? `${user.firstName} ${user.lastName}` 
              : user.firstName || user.lastName || null,
            role: 'VIEWER', // Default role - change to 'ADMIN' manually if needed
          },
        });

        console.log(`✅ Created user: ${newUser.email} (${newUser.id})`);
        created++;
      } catch (error) {
        console.error(`❌ Error creating user ${user.id}:`, error);
        errors++;
      }
    }

    console.log('\n📊 Sync Summary:');
    console.log(`   ✅ Created: ${created}`);
    console.log(`   ℹ️ Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📊 Total: ${clerkUsers.data.length}`);

    if (created > 0) {
      console.log('\n🎉 Users successfully synced to database!');
      console.log('   Run "npm run db:studio" to view them in Prisma Studio');
    }

  } catch (error) {
    console.error('\n❌ Fatal error syncing users:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the sync
console.log('🚀 Starting Clerk user sync...\n');
syncExistingUsers();

/**
 * Sync Current Clerk User to Database
 * 
 * This script manually creates a user in the database.
 * You need to provide your Clerk user ID.
 * 
 * Usage:
 *   1. Go to http://localhost:3000 and open browser console
 *   2. Type: window.__clerk_user_id
 *   3. Copy the ID and run: npx tsx scripts/sync-current-user.ts --id=user_xxxxx --email=your@email.com --promote
 */

import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const args = process.argv.slice(2);
    
    let userId: string | undefined;
    let email: string | undefined;
    let name: string | undefined;
    const promoteToAdmin = args.includes('--promote');

    // Parse arguments
    for (const arg of args) {
      if (arg.startsWith('--id=')) {
        userId = arg.split('=')[1];
      } else if (arg.startsWith('--email=')) {
        email = arg.split('=')[1];
      } else if (arg.startsWith('--name=')) {
        name = arg.split('=')[1];
      }
    }

    if (!userId || !email) {
      console.error('❌ Error: Missing required arguments\n');
      console.log('Usage:');
      console.log('  npx tsx scripts/sync-current-user.ts --id=user_xxxxx --email=your@email.com --promote');
      console.log('');
      console.log('To get your Clerk user ID:');
      console.log('  1. Go to http://localhost:3000');
      console.log('  2. Open browser developer console (F12)');
      console.log('  3. Type: Clerk.user.id');
      console.log('  4. Copy the ID (starts with user_)');
      console.log('');
      process.exit(1);
    }

    console.log('🔍 Checking for existing user...\n');

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (existingUser) {
      console.log(`ℹ️  User already exists in database:\n`);
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Name: ${existingUser.name || 'N/A'}`);
      console.log(`   Role: ${existingUser.role}`);
      console.log('');

      if (promoteToAdmin && existingUser.role !== 'SUPER_ADMIN') {
        console.log('🔄 Promoting user to SUPER_ADMIN...\n');
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { role: 'SUPER_ADMIN' },
        });
        console.log(`✅ User promoted to SUPER_ADMIN\n`);
        console.log(`   Email: ${updatedUser.email}`);
        console.log(`   Role: ${updatedUser.role}`);
      } else if (existingUser.role === 'SUPER_ADMIN') {
        console.log('👑 User is already a SUPER_ADMIN');
      }
      
      console.log('');
      return;
    }

    // Create new user
    const role: UserRole = promoteToAdmin ? 'SUPER_ADMIN' : 'VIEWER';

    console.log('🔄 Creating user in database...\n');

    const newUser = await prisma.user.create({
      data: {
        id: userId,
        email,
        name: name || null,
        role,
      },
    });

    console.log('✅ User successfully created!\n');
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Name: ${newUser.name || 'N/A'}`);
    console.log(`   Role: ${newUser.role}`);
    console.log(`   ID: ${newUser.id}`);
    console.log('');

    if (role === 'SUPER_ADMIN') {
      console.log('👑 User has been granted SUPER_ADMIN privileges');
    }
    console.log('');

  } catch (error) {
    console.error('\n❌ Error:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();


/**
 * Super Admin Setup Script
 * 
 * Promotes a user to SUPER_ADMIN role via command line.
 * 
 * Usage:
 *   npm run setup-super-admin -- --email=user@example.com
 *   npm run setup-super-admin -- --id=user_abc123
 */

import { PrismaClient, User, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    
    let email: string | undefined;
    let userId: string | undefined;

    // Extract --email or --id flags
    for (const arg of args) {
      if (arg.startsWith('--email=')) {
        email = arg.split('=')[1];
      } else if (arg.startsWith('--id=')) {
        userId = arg.split('=')[1];
      }
    }

    // Validate input
    if (!email && !userId) {
      console.error('❌ Error: Please provide either --email or --id flag');
      console.log('');
      console.log('Usage:');
      console.log('  npm run setup-super-admin -- --email=user@example.com');
      console.log('  npm run setup-super-admin -- --id=user_abc123');
      process.exit(1);
    }

    if (email && userId) {
      console.error('❌ Error: Please provide only one of --email or --id, not both');
      process.exit(1);
    }

    // Find user in database
    console.log('🔍 Searching for user...');
    
    let user: User | null = null;
    
    if (email) {
      console.log(`   Looking up by email: ${email}`);
      user = await prisma.user.findUnique({
        where: { email }
      });
    } else if (userId) {
      console.log(`   Looking up by ID: ${userId}`);
      user = await prisma.user.findUnique({
        where: { id: userId }
      });
    }

    // Check if user exists
    if (!user) {
      console.error('');
      console.error('❌ Error: User not found');
      console.error('');
      console.error('Please verify:');
      console.error('  - The email or ID is correct');
      console.error('  - The user exists in the database');
      console.error('  - The user has signed up via Clerk');
      process.exit(1);
    }

    console.log('✅ User found!');
    console.log('');
    console.log('User Details:');
    console.log(`  ID: ${user.id}`);
    console.log(`  Name: ${user.name || 'N/A'}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Current Role: ${user.role}`);
    console.log('');

    // Check if already super admin
    if (user.role === 'SUPER_ADMIN') {
      console.log('ℹ️  User is already a SUPER_ADMIN. No changes needed.');
      process.exit(0);
    }

    // Confirm promotion
    console.log('⚠️  WARNING: You are about to promote this user to SUPER_ADMIN');
    console.log('   Super admins have the highest level of access and can:');
    console.log('   - Manage other admins');
    console.log('   - Promote users to admin or super admin');
    console.log('   - Access all system features');
    console.log('');

    // Update user role
    console.log('🔄 Promoting user to SUPER_ADMIN...');
    
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'SUPER_ADMIN' as UserRole }
    });

    console.log('');
    console.log('✅ SUCCESS! User has been promoted to SUPER_ADMIN');
    console.log('');
    console.log('Updated User Details:');
    console.log(`  ID: ${updatedUser.id}`);
    console.log(`  Name: ${updatedUser.name || 'N/A'}`);
    console.log(`  Email: ${updatedUser.email}`);
    console.log(`  New Role: ${updatedUser.role}`);
    console.log('');
    console.log('👑 This user now has super admin privileges.');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ Unexpected error occurred:');
    console.error(error);
    console.error('');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main();

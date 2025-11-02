import { PrismaClient, UserRole } from '@prisma/client';
import * as readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('\n🔧 Manual User Creation Script');
  console.log('================================\n');
  
  console.log('To find your Clerk User ID:');
  console.log('1. Go to: https://dashboard.clerk.com');
  console.log('2. Select your application');
  console.log('3. Go to "Users" section');
  console.log('4. Click on your user');
  console.log('5. Copy the User ID (starts with "user_")\n');
  
  const userId = await question('Enter your Clerk User ID: ');
  const email = await question('Enter your email: ');
  const name = await question('Enter your name (optional, press Enter to skip): ');
  
  const roleInput = await question('Enter role (SUPER_ADMIN/ADMIN/USER/VIEWER) [default: SUPER_ADMIN]: ');
  const role = roleInput.trim() || 'SUPER_ADMIN';
  
  console.log('\n📝 Creating user with:');
  console.log(`   ID: ${userId}`);
  console.log(`   Email: ${email}`);
  console.log(`   Name: ${name || 'N/A'}`);
  console.log(`   Role: ${role}\n`);
  
  try {
    const user = await prisma.user.create({
      data: {
        id: userId.trim(),
        email: email.trim(),
        name: name.trim() || null,
        role: role as UserRole,
      },
    });
    
    console.log('\n✅ SUCCESS! User created in database:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name || 'N/A'}`);
    console.log(`   Role: ${user.role}`);
    console.log('\n🎉 You can now access the admin panel!\n');
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      console.log('\n⚠️  User already exists in database!');
      console.log('   Trying to update instead...\n');
      
      const user = await prisma.user.update({
        where: { id: userId.trim() },
        data: {
          email: email.trim(),
          name: name.trim() || null,
          role: role as UserRole,
        },
      });
      
      console.log('✅ User updated successfully!');
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}\n`);
    } else {
      console.error('\n❌ Error creating user:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main().catch(console.error);

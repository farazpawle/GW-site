import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      take: 10,
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    console.log(`\n📋 Found ${users.length} users in database:\n`);
    
    if (users.length === 0) {
      console.log('   No users found. Please sign up first at /sign-up\n');
    } else {
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email || 'N/A'}`);
        console.log(`      Name: ${user.name || 'N/A'}`);
        console.log(`      Role: ${user.role}`);
        console.log(`      ID: ${user.id}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();

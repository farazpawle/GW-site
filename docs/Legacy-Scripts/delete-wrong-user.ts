import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteWrongUser() {
  try {
    // Delete user with ID "faraz" (wrong entry)
    const deleted = await prisma.user.deleteMany({
      where: {
        OR: [
          { id: 'faraz' },
          { id: 'farazpawle@gmail.com' }
        ]
      }
    });
    
    console.log(`✅ Deleted ${deleted.count} wrong user entries`);
    
    // List remaining users
    const users = await prisma.user.findMany();
    console.log(`\n📋 Remaining users: ${users.length}`);
    users.forEach(u => {
      console.log(`   - ${u.email} (ID: ${u.id}, Role: ${u.role})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteWrongUser();

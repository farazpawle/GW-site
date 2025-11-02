import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addEGHLogoSetting() {
  try {
    // Check if the setting already exists
    const existing = await prisma.settings.findUnique({
      where: { key: 'egh_logo' }
    });

    if (existing) {
      console.log('✓ EGH logo setting already exists');
      return;
    }

    // Add the EGH logo setting
    await prisma.settings.create({
      data: {
        key: 'egh_logo',
        value: '/images/egh_member_200x.avif',
        category: 'CONTACT',
      }
    });

    console.log('✓ EGH logo setting added successfully');
  } catch (error) {
    console.error('Error adding EGH logo setting:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addEGHLogoSetting();

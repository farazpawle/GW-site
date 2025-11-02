import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkEghLogo() {
  try {
    console.log('🔍 Checking for egh_logo setting...\n');

    // Check if egh_logo exists in settings
    const eghLogoSetting = await prisma.settings.findUnique({
      where: {
        key: 'egh_logo',
      },
    });

    if (eghLogoSetting) {
      console.log('✅ egh_logo setting found:');
      console.log('   Key:', eghLogoSetting.key);
      console.log('   Value:', eghLogoSetting.value);
      console.log('   Category:', eghLogoSetting.category);
      console.log('   Updated:', eghLogoSetting.updatedAt);
    } else {
      console.log('❌ egh_logo setting NOT found in database');
    }

    // Also check all CONTACT category settings
    console.log('\n📋 All CONTACT settings:');
    const contactSettings = await prisma.settings.findMany({
      where: {
        category: 'CONTACT',
      },
      orderBy: {
        key: 'asc',
      },
    });

    if (contactSettings.length > 0) {
      contactSettings.forEach((setting) => {
        console.log(`   - ${setting.key}: ${setting.value.substring(0, 50)}${setting.value.length > 50 ? '...' : ''}`);
      });
    } else {
      console.log('   No CONTACT settings found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEghLogo();

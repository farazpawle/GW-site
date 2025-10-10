/**
 * Script to fix ecommerce_enabled setting format
 * Converts from nested object { enabled: boolean } to simple boolean
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Fixing ecommerce_enabled setting format...\n');

  try {
    // Get current setting
    const currentSetting = await prisma.siteSettings.findUnique({
      where: { key: 'ecommerce_enabled' },
    });

    if (!currentSetting) {
      console.log('⚠️  No ecommerce_enabled setting found. Creating default...');
      await prisma.siteSettings.create({
        data: {
          key: 'ecommerce_enabled',
          value: false,
        },
      });
      console.log('✅ Created ecommerce_enabled = false');
      return;
    }

    console.log('Current value:', JSON.stringify(currentSetting.value));

    // Check if it's already in the correct format (boolean)
    if (typeof currentSetting.value === 'boolean') {
      console.log('✅ Setting is already in correct format (boolean)');
      return;
    }

    // Check if it's in legacy format (object with enabled property)
    if (
      typeof currentSetting.value === 'object' &&
      currentSetting.value !== null &&
      'enabled' in currentSetting.value
    ) {
      const legacyValue = currentSetting.value as { enabled: boolean };
      const newValue = legacyValue.enabled === true;

      console.log(`🔄 Converting from object format to boolean: ${newValue}`);

      await prisma.siteSettings.update({
        where: { key: 'ecommerce_enabled' },
        data: {
          value: newValue,
        },
      });

      console.log('✅ Successfully converted to boolean format');
      console.log('New value:', newValue);
    } else {
      console.log('⚠️  Unexpected format. Setting to false as default.');
      await prisma.siteSettings.update({
        where: { key: 'ecommerce_enabled' },
        data: {
          value: false,
        },
      });
    }
  } catch (error) {
    console.error('❌ Error fixing setting:', error);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

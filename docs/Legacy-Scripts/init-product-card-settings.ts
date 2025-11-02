/**
 * Initialize Product Card Settings
 * Creates all 11 product_card_* settings in the database
 */

import { prisma } from '@/lib/prisma';

async function initializeSettings() {
  console.log('🎬 Initializing Product Card Settings\n');

  const defaultSettings = [
    { key: 'product_card_showPartNumber', value: 'true' },
    { key: 'product_card_showSku', value: 'true' },
    { key: 'product_card_showBrand', value: 'true' },
    { key: 'product_card_showOrigin', value: 'true' },
    { key: 'product_card_showCategory', value: 'true' },
    { key: 'product_card_showDescription', value: 'true' },
    { key: 'product_card_showTags', value: 'true' },
    { key: 'product_card_showPrice', value: 'true' },
    { key: 'product_card_showComparePrice', value: 'true' },
    { key: 'product_card_showDiscountBadge', value: 'true' },
    { key: 'product_card_showStockStatus', value: 'true' },
  ];

  try {
    console.log('Creating/updating settings...\n');
    
    for (const setting of defaultSettings) {
      await prisma.siteSettings.upsert({
        where: { key: setting.key },
        create: {
          key: setting.key,
          value: setting.value
        },
        update: {
          value: setting.value
        }
      });
      console.log(`✅ ${setting.key}: ${setting.value}`);
    }

    console.log('\n✅ All settings initialized!');
    console.log('\nNow you can:');
    console.log('1. Go to Admin → Settings → Product Card');
    console.log('2. Toggle any field ON/OFF');
    console.log('3. Click "Save Changes"');
    console.log('4. Run check-current-state.ts to verify');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

initializeSettings();

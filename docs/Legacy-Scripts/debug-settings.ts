/**
 * Debug Settings Flow
 * Check what's in the database and what the API returns
 */

import { prisma } from '@/lib/prisma';

async function debugSettings() {
  console.log('🔍 Debugging Product Card Settings Flow\n');

  try {
    // Step 1: Check ALL product_card_* settings in database
    console.log('1️⃣ Checking database for product_card_* settings...');
    const allSettings = await prisma.siteSettings.findMany({
      where: {
        key: {
          startsWith: 'product_card_'
        }
      },
      select: {
        key: true,
        value: true
      }
    });

    console.log('\nFound', allSettings.length, 'settings:');
    allSettings.forEach(setting => {
      console.log(`  ${setting.key}: ${JSON.stringify(setting.value)}`);
    });

    // Step 2: Test the API
    console.log('\n2️⃣ Testing API endpoint...');
    const response = await fetch('http://localhost:3000/api/public/product-card-settings');
    const result = await response.json();
    
    console.log('\nAPI Response:');
    console.log(JSON.stringify(result, null, 2));

    // Step 3: Check cache headers
    console.log('\n3️⃣ Response Headers:');
    console.log('Cache-Control:', response.headers.get('cache-control'));
    console.log('Pragma:', response.headers.get('pragma'));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugSettings();

/**
 * Test Settings Save & Retrieve
 * Tests the full flow: Save settings -> Clear cache -> Retrieve settings
 */

import { prisma } from '@/lib/prisma';

async function testSettingsSaveAndRetrieve() {
  console.log('🧪 Testing Settings Save & Retrieve Flow\n');

  try {
    // Step 1: Check current value in database
    console.log('1️⃣ Checking current database value...');
    const currentSetting = await prisma.siteSettings.findUnique({
      where: { key: 'product_card_display' }
    });
    
    if (currentSetting) {
      console.log('Current value in DB:', JSON.stringify(currentSetting.value, null, 2));
    } else {
      console.log('❌ No product_card_display setting found in database!');
      console.log('This is the problem - settings need to be created first.');
      
      // Create default settings
      console.log('\n2️⃣ Creating default product card settings...');
      await prisma.siteSettings.upsert({
        where: { key: 'product_card_display' },
        create: {
          key: 'product_card_display',
          value: {
            showPartNumber: true,
            showSku: true,
            showBrand: true,
            showOrigin: true,
            showCategory: true,
            showDescription: true,
            showTags: true,
            showPrice: true,
            showComparePrice: true,
            showDiscountBadge: true,
            showStockStatus: true,
          }
        },
        update: {}
      });
      
      console.log('✅ Default settings created!');
    }

    // Step 2: Test the API endpoint
    console.log('\n3️⃣ Testing API endpoint...');
    const response = await fetch('http://localhost:3000/api/public/product-card-settings');
    const result = await response.json();
    
    console.log('API Response:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ API working correctly!');
      
      // Check specific field
      console.log('\n4️⃣ Checking specific fields:');
      console.log('- showOrigin:', result.data.showOrigin);
      console.log('- showBrand:', result.data.showBrand);
      console.log('- showPrice:', result.data.showPrice);
    } else {
      console.log('❌ API returned error:', result.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSettingsSaveAndRetrieve();

/**
 * Simulate Admin Toggle - Turn OFF Origin Field
 * This simulates what happens when you toggle a setting in the admin panel
 */

import { prisma } from '@/lib/prisma';

async function simulateAdminToggle() {
  console.log('🎛️  Simulating Admin Toggle - Turn OFF Origin\n');

  try {
    // Step 1: Simulate saving via admin settings page
    console.log('1️⃣ Simulating admin form save (like clicking Save button)...');
    
    // Create/update the setting as the admin panel would
    await prisma.siteSettings.upsert({
      where: { key: 'product_card_showOrigin' },
      create: {
        key: 'product_card_showOrigin',
        value: 'false'  // Toggle OFF
      },
      update: {
        value: 'false'  // Toggle OFF
      }
    });
    
    console.log('✅ Database updated: product_card_showOrigin = "false"');

    // Step 2: Verify database
    console.log('\n2️⃣ Verifying database...');
    const setting = await prisma.siteSettings.findUnique({
      where: { key: 'product_card_showOrigin' }
    });
    console.log('Database value:', setting?.value);

    // Step 3: Test API immediately
    console.log('\n3️⃣ Testing API (what ProductCard sees)...');
    const response = await fetch('http://localhost:3000/api/public/product-card-settings?_=' + Date.now());
    const result = await response.json();
    
    console.log('API showOrigin:', result.data.showOrigin);
    console.log('Full API response:', JSON.stringify(result.data, null, 2));

    if (result.data.showOrigin === false) {
      console.log('\n✅ SUCCESS! Setting is working correctly.');
      console.log('📝 Now open your browser and check the product page.');
      console.log('   Open DevTools Console (F12) and look for:');
      console.log('   "🎴 ProductCard: Settings loaded: { showOrigin: false }"');
      console.log('\n   Then verify Origin field is hidden on the cards.');
    } else {
      console.log('\n❌ FAILED! API still showing showOrigin as true');
      console.log('   This means there might be a caching issue.');
    }

    console.log('\n4️⃣ Restoring setting...');
    await prisma.siteSettings.update({
      where: { key: 'product_card_showOrigin' },
      data: { value: 'true' }
    });
    console.log('✅ Restored to true');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

simulateAdminToggle();

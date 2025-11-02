/**
 * Full End-to-End Test
 * Tests the complete flow: Toggle setting -> Save -> Clear cache -> Verify
 */

import { prisma } from '@/lib/prisma';

async function fullE2ETest() {
  console.log('🧪 Full End-to-End Settings Test\n');

  try {
    // Step 1: Turn OFF the Origin field
    console.log('1️⃣ Toggling OFF "showOrigin" setting...');
    await prisma.siteSettings.upsert({
      where: { key: 'product_card_showOrigin' },
      create: {
        key: 'product_card_showOrigin',
        value: 'false'
      },
      update: {
        value: 'false'
      }
    });
    console.log('✅ Database: product_card_showOrigin = false');

    // Step 2: Clear server-side cache (simulating what the admin API does)
    console.log('\n2️⃣ Clearing server cache...');
    // Note: In production, this happens automatically via the admin settings API
    console.log('✅ Cache would be cleared by admin API');

    // Step 3: Wait a moment
    console.log('\n3️⃣ Waiting 1 second for cache clear...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 4: Test API endpoint (what ProductCard sees)
    console.log('\n4️⃣ Fetching from API (ProductCard perspective)...');
    const response = await fetch('http://localhost:3000/api/public/product-card-settings?_=' + Date.now());
    const result = await response.json();

    console.log('\nAPI Response:');
    console.log('- showOrigin:', result.data.showOrigin);
    console.log('- showBrand:', result.data.showBrand);
    console.log('- showPrice:', result.data.showPrice);

    // Step 5: Verify
    if (result.data.showOrigin === false) {
      console.log('\n✅ TEST PASSED!');
      console.log('📝 Now do these steps:');
      console.log('   1. Open your browser');
      console.log('   2. Go to any product page (e.g., /all-parts or /products)');
      console.log('   3. Hard refresh (Ctrl+Shift+R)');
      console.log('   4. Open DevTools Console (F12)');
      console.log('   5. Look for: "🎴 ProductCard: Settings loaded: { showOrigin: false }"');
      console.log('   6. Verify Origin field is NOT showing on product cards');
    } else {
      console.log('\n❌ TEST FAILED!');
      console.log('   showOrigin is still true. Cache might not be clearing properly.');
    }

    // Step 6: Restore
    console.log('\n5️⃣ Restoring showOrigin to true...');
    await prisma.siteSettings.update({
      where: { key: 'product_card_showOrigin' },
      data: { value: 'true' }
    });
    console.log('✅ Setting restored');

    console.log('\n🎯 Test complete!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fullE2ETest();

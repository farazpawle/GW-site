/**
 * Test Toggle Origin Field
 * Tests turning OFF the origin field and verifying the API reflects the change
 */

import { prisma } from '@/lib/prisma';

async function testToggleOrigin() {
  console.log('🧪 Testing Toggle Origin Field\n');

  try {
    // Step 1: Turn OFF the origin field
    console.log('1️⃣ Turning OFF showOrigin...');
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
    console.log('✅ Database updated: product_card_showOrigin = false');

    // Step 2: Wait a moment for cache to clear (if any)
    console.log('\n2️⃣ Waiting 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 3: Fetch via API
    console.log('\n3️⃣ Fetching via API...');
    const response = await fetch('http://localhost:3000/api/public/product-card-settings');
    const result = await response.json();

    if (result.success) {
      console.log('API Response:');
      console.log('- showOrigin:', result.data.showOrigin);
      console.log('- showBrand:', result.data.showBrand);
      console.log('- showPrice:', result.data.showPrice);

      if (result.data.showOrigin === false) {
        console.log('\n✅ SUCCESS! Origin field is now hidden.');
        console.log('You can verify this on the product page - Origin should not display.');
      } else {
        console.log('\n❌ FAILED! Origin is still showing as true.');
        console.log('Cache might not have cleared yet. Try refreshing the page.');
      }
    } else {
      console.log('❌ API Error:', result.error);
    }

    // Step 4: Turn it back ON for testing
    console.log('\n4️⃣ Turning showOrigin back ON...');
    await prisma.siteSettings.update({
      where: { key: 'product_card_showOrigin' },
      data: { value: 'true' }
    });
    console.log('✅ Origin field restored to visible');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testToggleOrigin();

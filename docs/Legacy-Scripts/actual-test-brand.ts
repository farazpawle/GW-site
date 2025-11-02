/**
 * ACTUAL TEST: Disable Brand Field Through Database
 * Then verify entire flow
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function actualTest() {
  console.log('🔥 REAL TEST - Disabling Brand Field\n');
  console.log('═══════════════════════════════════════\n');

  try {
    // Step 1: Check current value
    console.log('1️⃣ Current database value:');
    let setting = await prisma.siteSettings.findUnique({
      where: { key: 'product_card_showBrand' }
    });
    console.log(`   product_card_showBrand = ${setting?.value}\n`);

    // Step 2: Disable it
    console.log('2️⃣ Setting to FALSE...');
    await prisma.siteSettings.update({
      where: { key: 'product_card_showBrand' },
      data: { value: 'false' }
    });
    console.log('   ✅ Database updated\n');

    // Step 3: Verify database
    console.log('3️⃣ Verify database:');
    setting = await prisma.siteSettings.findUnique({
      where: { key: 'product_card_showBrand' }
    });
    console.log(`   product_card_showBrand = ${setting?.value}\n`);

    // Step 4: Wait for cache
    console.log('4️⃣ Waiting 6 seconds for cache...');
    await wait(6000);
    console.log('   ✅ Done\n');

    // Step 5: Check API
    console.log('5️⃣ Check API response:');
    const response = await fetch('http://localhost:3000/api/public/product-card-settings?_=' + Date.now());
    const data = await response.json();
    console.log(`   showBrand = ${data.data.showBrand}\n`);

    // Step 6: Result
    console.log('═══════════════════════════════════════');
    if (data.data.showBrand === false) {
      console.log('✅ SUCCESS! Brand is now FALSE in API');
      console.log('\nNow go to: http://localhost:3000/products');
      console.log('Hard refresh (Ctrl+Shift+R)');
      console.log('Brand (🏷️ RAYBESTOS) should NOT appear on cards');
      console.log('Debug banner should show: showBrand=NO\n');
    } else {
      console.log('❌ FAILED! Brand is still TRUE in API');
      console.log('Cache issue or API problem\n');
    }

    console.log('To revert: npm run tsx scripts/check-api-now.ts revert');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

actualTest();

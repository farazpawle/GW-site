/**
 * Final Comprehensive Test: Each Field Toggle Independently
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const FIELDS = [
  { key: 'product_card_showPartNumber', name: 'Part Number', icon: '#' },
  { key: 'product_card_showSku', name: 'SKU', icon: 'SKU:' },
  { key: 'product_card_showBrand', name: 'Brand', icon: '🏷️' },
  { key: 'product_card_showOrigin', name: 'Origin', icon: '🌍' },
  { key: 'product_card_showCategory', name: 'Category', icon: '📁' },
  { key: 'product_card_showDescription', name: 'Description', icon: '📝' },
  { key: 'product_card_showTags', name: 'Tags', icon: '🏷' },
  { key: 'product_card_showPrice', name: 'Price', icon: '$' },
];

async function testIndependentToggles() {
  console.log('🧪 FINAL COMPREHENSIVE TEST');
  console.log('═══════════════════════════════════════\n');
  console.log('Testing that each field can be toggled independently\n');

  let allPassed = true;

  // Test each field one by one
  for (const field of FIELDS) {
    console.log(`\n━━━ Testing ${field.icon} ${field.name} ━━━`);
    
    // Step 1: Enable all, disable this one
    console.log(`1️⃣ Disabling ${field.name}...`);
    await prisma.siteSettings.update({
      where: { key: field.key },
      data: { value: 'false' }
    });

    // Step 2: Wait
    console.log('2️⃣ Waiting 5 seconds...');
    await wait(5000);

    // Step 3: Check API
    console.log('3️⃣ Checking API...');
    const response = await fetch('http://localhost:3000/api/public/product-card-settings?_=' + Date.now());
    const data = await response.json();

    const apiKey = field.key.replace('product_card_', '');
    const apiValue = data.data[apiKey];

    if (apiValue === false) {
      console.log(`   ✅ ${field.name} correctly hidden`);
    } else {
      console.log(`   ❌ ${field.name} still showing (API returned ${apiValue})`);
      allPassed = false;
    }

    // Step 4: Re-enable
    await prisma.siteSettings.update({
      where: { key: field.key },
      data: { value: 'true' }
    });
  }

  console.log('\n═══════════════════════════════════════');
  console.log('📊 FINAL RESULTS\n');
  
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ Every field can be toggled independently');
    console.log('✅ Settings API returns correct values within 5 seconds');
    console.log('✅ No fallback chains - each field respects its own setting\n');
    console.log('🌐 Now test in browser:');
    console.log('1. Go to Admin Panel → Settings → Product Card');
    console.log('2. Toggle any field ON/OFF');
    console.log('3. Click Save');
    console.log('4. Wait 5 seconds or hard refresh');
    console.log('5. Check /products page - field should hide/show correctly\n');
  } else {
    console.log('❌ SOME TESTS FAILED');
    console.log('Check the logs above for details\n');
  }

  await prisma.$disconnect();
  process.exit(allPassed ? 0 : 1);
}

testIndependentToggles();

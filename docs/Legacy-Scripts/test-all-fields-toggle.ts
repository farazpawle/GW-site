/**
 * Test All Fields Independently
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function testAllFields() {
  console.log('🧪 Testing ALL Product Card Fields\n');
  console.log('═══════════════════════════════════════\n');

  try {
    // Step 1: Disable ALL fields
    console.log('Step 1: Disabling ALL fields...');
    const allFields = [
      'product_card_showPartNumber',
      'product_card_showSku',
      'product_card_showBrand',
      'product_card_showOrigin',
      'product_card_showCategory',
      'product_card_showDescription',
      'product_card_showTags',
      'product_card_showPrice',
      'product_card_showComparePrice',
      'product_card_showDiscountBadge',
      'product_card_showStockStatus'
    ];

    await prisma.siteSettings.updateMany({
      where: { key: { in: allFields } },
      data: { value: 'false' }
    });
    console.log('✅ All fields disabled in database\n');

    // Step 2: Wait for cache
    console.log('Step 2: Waiting 5 seconds for cache...');
    await wait(5000);
    console.log('✅ Cache cleared\n');

    // Step 3: Verify API
    console.log('Step 3: Checking API...');
    const response = await fetch('http://localhost:3000/api/public/product-card-settings?_=' + Date.now());
    const data = await response.json();
    
    if (data.success) {
      const allHidden = Object.values(data.data).every(v => v === false);
      
      console.log('\n📋 API Response:');
      Object.entries(data.data).forEach(([key, value]) => {
        console.log(`   ${key}: ${value ? '✅ Visible' : '❌ Hidden'}`);
      });

      console.log('\n═══════════════════════════════════════');
      if (allHidden) {
        console.log('✅ ALL FIELDS HIDDEN IN API!\n');
        console.log('Now test the website:');
        console.log('1. Go to http://localhost:3000/products');
        console.log('2. Hard refresh (Ctrl+Shift+R)');
        console.log('3. Product cards should be MINIMAL:');
        console.log('   - Only product image and name should show');
        console.log('   - NO brand, origin, part number, sku, etc.');
        console.log('   - NO price or tags');
      } else {
        console.log('❌ Some fields still showing as visible!');
      }
    }

    console.log('\n═══════════════════════════════════════');
    console.log('Run with "revert" to restore all fields\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function revertAll() {
  console.log('🔄 Enabling ALL fields...\n');
  
  const allFields = [
    'product_card_showPartNumber',
    'product_card_showSku',
    'product_card_showBrand',
    'product_card_showOrigin',
    'product_card_showCategory',
    'product_card_showDescription',
    'product_card_showTags',
    'product_card_showPrice',
    'product_card_showComparePrice',
    'product_card_showDiscountBadge',
    'product_card_showStockStatus'
  ];

  await prisma.siteSettings.updateMany({
    where: { key: { in: allFields } },
    data: { value: 'true' }
  });
  
  console.log('✅ All fields restored to visible');
  await prisma.$disconnect();
}

const shouldRevert = process.argv.includes('revert');
if (shouldRevert) {
  revertAll();
} else {
  testAllFields();
}

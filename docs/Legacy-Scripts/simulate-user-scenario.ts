/**
 * Simulate User's Issue: Test Part Number, SKU, Origin Hiding
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function simulateUserScenario() {
  console.log('🧪 Simulating User Scenario');
  console.log('═══════════════════════════════════════\n');
  
  try {
    // Step 1: Disable Part Number, SKU, Origin (as user did)
    console.log('Step 1: Disabling Part Number, SKU, and Origin...');
    await prisma.siteSettings.updateMany({
      where: {
        key: {
          in: ['product_card_showPartNumber', 'product_card_showSku', 'product_card_showOrigin']
        }
      },
      data: {
        value: 'false'
      }
    });
    console.log('✅ Settings updated in database\n');

    // Step 2: Wait for cache
    console.log('Step 2: Waiting 5 seconds for cache to clear...');
    await wait(5000);
    console.log('✅ Cache cleared\n');

    // Step 3: Check API
    console.log('Step 3: Checking API response...');
    const response = await fetch('http://localhost:3000/api/public/product-card-settings?_=' + Date.now());
    const data = await response.json();
    
    if (data.success) {
      console.log('\n📋 Current API Settings:');
      console.log(`   Part Number: ${data.data.showPartNumber ? '✅ Visible' : '❌ Hidden'}`);
      console.log(`   SKU: ${data.data.showSku ? '✅ Visible' : '❌ Hidden'}`);
      console.log(`   Origin: ${data.data.showOrigin ? '✅ Visible' : '❌ Hidden'}`);
      console.log(`   Price: ${data.data.showPrice ? '✅ Visible' : '❌ Hidden'}`);
      console.log(`   Brand: ${data.data.showBrand ? '✅ Visible' : '❌ Hidden'}`);

      // Verify
      const allCorrect = 
        data.data.showPartNumber === false &&
        data.data.showSku === false &&
        data.data.showOrigin === false &&
        data.data.showPrice === true &&
        data.data.showBrand === true;

      console.log('\n═══════════════════════════════════════');
      if (allCorrect) {
        console.log('✅ API IS CORRECT!');
        console.log('\nNow check the website:');
        console.log('1. Go to http://localhost:3000/products');
        console.log('2. Hard refresh (Ctrl+Shift+R)');
        console.log('3. Product cards should show:');
        console.log('   ✅ Brand (RAYBESTOS)');
        console.log('   ✅ Price (if ecommerce mode)');
        console.log('   ❌ Part Number (#BP-CER-002)');
        console.log('   ❌ SKU');
        console.log('   ❌ Origin (USA flag)');
      } else {
        console.log('❌ API STILL HAS WRONG VALUES');
        console.log('Try restarting the Next.js dev server');
      }
    }

    console.log('\n═══════════════════════════════════════');
    console.log('To revert: Run this script with "revert" argument');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function revertSettings() {
  console.log('🔄 Reverting settings to all visible...\n');
  
  await prisma.siteSettings.updateMany({
    where: {
      key: {
        in: ['product_card_showPartNumber', 'product_card_showSku', 'product_card_showOrigin']
      }
    },
    data: {
      value: 'true'
    }
  });
  
  console.log('✅ All fields restored to visible');
  await prisma.$disconnect();
}

// Check arguments
const shouldRevert = process.argv.includes('revert');

if (shouldRevert) {
  revertSettings();
} else {
  simulateUserScenario();
}

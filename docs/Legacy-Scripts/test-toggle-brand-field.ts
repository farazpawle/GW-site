/**
 * Test Script: Toggle Brand Field
 * 
 * This script will:
 * 1. Set showBrand to false
 * 2. Clear cache
 * 3. Verify the change in database
 * 4. Test API endpoint
 * 5. Provide instructions for frontend testing
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testToggle() {
  console.log('🧪 Testing Brand Field Toggle\n');

  try {
    // Step 1: Set showBrand to false
    console.log('📝 Step 1: Setting product_card_showBrand to false...');
    await prisma.siteSettings.upsert({
      where: { key: 'product_card_showBrand' },
      update: { value: 'false' },
      create: {
        key: 'product_card_showBrand',
        value: 'false'
      }
    });
    console.log('✅ Database updated');

    // Step 2: Verify the change
    console.log('\n📊 Step 2: Verifying database value...');
    const setting = await prisma.siteSettings.findUnique({
      where: { key: 'product_card_showBrand' }
    });
    console.log(`   Value: ${setting?.value}`);
    console.log(`   Type: ${typeof setting?.value}`);

    // Step 3: Test API endpoint
    console.log('\n🌐 Step 3: Testing API endpoint...');
    const response = await fetch('http://localhost:3000/api/public/product-card-settings');
    const data = await response.json();
    
    if (data.success) {
      console.log(`   showBrand from API: ${data.data.showBrand}`);
      console.log(`   Type: ${typeof data.data.showBrand}`);
      
      if (data.data.showBrand === false) {
        console.log('✅ API correctly returns false');
      } else {
        console.log('❌ API still returns true - cache issue?');
      }
    }

    // Step 4: Instructions
    console.log('\n📋 Step 4: Frontend Testing Instructions:');
    console.log('1. Open browser to http://localhost:3000/products');
    console.log('2. Open DevTools Console (F12)');
    console.log('3. Hard refresh the page (Ctrl+Shift+R)');
    console.log('4. Look for console log: "🎴 ProductCard: Settings loaded:"');
    console.log('5. Check if showBrand is false in the logged settings');
    console.log('6. Verify that brand name (🏷️) is NOT displayed on product cards');
    console.log('\nExpected: Brand name should be hidden on all product cards');
    console.log('\nTo revert: Run this script with revert=true');

  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function revert() {
  console.log('🔄 Reverting brand field to visible...\n');
  
  try {
    await prisma.siteSettings.upsert({
      where: { key: 'product_card_showBrand' },
      update: { value: 'true' },
      create: {
        key: 'product_card_showBrand',
        value: 'true'
      }
    });
    console.log('✅ Brand field restored to visible');
  } catch (error) {
    console.error('Error during revert:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Check if revert argument is provided
const shouldRevert = process.argv.includes('revert=true');

if (shouldRevert) {
  revert();
} else {
  testToggle();
}

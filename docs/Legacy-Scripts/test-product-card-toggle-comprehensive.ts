/**
 * Comprehensive Test: Product Card Settings Toggle
 * 
 * Tests the complete flow for multiple fields:
 * 1. Set field to false in database
 * 2. Wait 5 seconds for cache to clear
 * 3. Verify API returns false
 * 4. Confirm fix works as expected
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fields to test
const TEST_FIELDS = [
  { key: 'product_card_showBrand', name: 'Brand' },
  { key: 'product_card_showOrigin', name: 'Origin' },
  { key: 'product_card_showPartNumber', name: 'Part Number' }
];

// Helper to wait
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function testField(key: string, name: string): Promise<boolean> {
  console.log(`\n━━━ Testing ${name} Field ━━━`);
  
  try {
    // Step 1: Set to false
    console.log(`1️⃣ Setting ${key} to false...`);
    await prisma.siteSettings.upsert({
      where: { key },
      update: { value: 'false' },
      create: { key, value: 'false' }
    });
    console.log('   ✅ Database updated');

    // Step 2: Wait 5 seconds
    console.log('2️⃣ Waiting 5 seconds for cache to clear...');
    await wait(5000);
    console.log('   ✅ Wait complete');

    // Step 3: Check API
    console.log('3️⃣ Checking API response...');
    const response = await fetch('http://localhost:3000/api/public/product-card-settings?_=' + Date.now());
    const data = await response.json();
    
    if (!data.success) {
      console.log('   ❌ API request failed');
      return false;
    }

    // Get the setting name (remove product_card_ prefix and convert to camelCase)
    const settingKey = key.replace('product_card_', '');
    const apiValue = data.data[settingKey];
    
    console.log(`   API value for ${settingKey}: ${apiValue}`);
    
    if (apiValue === false) {
      console.log(`   ✅ ${name} correctly returns false`);
      return true;
    } else {
      console.log(`   ❌ ${name} still returns ${apiValue} (expected false)`);
      return false;
    }
    
  } catch (error) {
    console.error(`   ❌ Error testing ${name}:`, error);
    return false;
  }
}

async function revertField(key: string, name: string) {
  console.log(`   Reverting ${name} to true...`);
  await prisma.siteSettings.upsert({
    where: { key },
    update: { value: 'true' },
    create: { key, value: 'true' }
  });
}

async function runTests() {
  console.log('🧪 COMPREHENSIVE PRODUCT CARD SETTINGS TEST');
  console.log('═══════════════════════════════════════════\n');
  console.log('This test verifies that the 5-second cache fix works correctly.');
  console.log('Testing 3 different fields to ensure all toggles function properly.\n');

  const results: { field: string; passed: boolean }[] = [];

  // Test each field
  for (const field of TEST_FIELDS) {
    const passed = await testField(field.key, field.name);
    results.push({ field: field.name, passed });
  }

  // Revert all fields
  console.log('\n━━━ Reverting All Fields ━━━');
  for (const field of TEST_FIELDS) {
    await revertField(field.key, field.name);
  }
  console.log('✅ All fields reverted to true\n');

  // Summary
  console.log('═══════════════════════════════════════════');
  console.log('📊 TEST RESULTS SUMMARY\n');
  
  let allPassed = true;
  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${result.field}`);
    if (!result.passed) allPassed = false;
  });

  console.log('\n═══════════════════════════════════════════');
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ Product card settings toggle is working correctly.');
    console.log('✅ Cache clears within 5 seconds as expected.');
    console.log('✅ API returns correct values immediately after cache clear.\n');
  } else {
    console.log('⚠️  SOME TESTS FAILED');
    console.log('Please check the logs above for details.\n');
  }

  await prisma.$disconnect();
  process.exit(allPassed ? 0 : 1);
}

runTests();

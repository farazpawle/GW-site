/**
 * Test the FIXED admin save functionality
 * This script verifies that when admin toggles are changed, they save to BOTH tables
 */

import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('\n🧪 Testing Admin Save Fix...\n');

  // Step 1: Check current state in BOTH tables
  console.log('📊 BEFORE: Current state in both tables\n');
  
  const siteBefore = await prisma.siteSettings.findUnique({
    where: { key: 'product_card_showBrand' }
  });
  console.log(`   SiteSettings.product_card_showBrand = ${siteBefore?.value}`);
  
  const settingsBefore = await prisma.settings.findUnique({
    where: { key: 'product_card_showBrand' }
  });
  console.log(`   Settings.product_card_showBrand     = ${settingsBefore?.value}`);

  // Step 2: Instructions
  console.log('\n📝 INSTRUCTIONS:');
  console.log('   1. Go to admin panel: http://localhost:3000/admin/settings');
  console.log('   2. Click "Product Card" tab');
  console.log('   3. Toggle the "Brand" field ON');
  console.log('   4. Click "Save Settings"');
  console.log('   5. Come back here and press Enter...\n');

  // Wait for user
  await new Promise<void>((resolve) => {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('Press Enter after saving in admin panel... ', () => {
      rl.close();
      resolve();
    });
  });

  // Step 3: Check state AFTER save
  console.log('\n📊 AFTER: State after admin save\n');
  
  const siteAfter = await prisma.siteSettings.findUnique({
    where: { key: 'product_card_showBrand' }
  });
  console.log(`   SiteSettings.product_card_showBrand = ${siteAfter?.value}`);
  
  const settingsAfter = await prisma.settings.findUnique({
    where: { key: 'product_card_showBrand' }
  });
  console.log(`   Settings.product_card_showBrand     = ${settingsAfter?.value}`);

  // Step 4: Verify both tables are in sync
  console.log('\n✅ VERIFICATION:\n');
  if (siteAfter?.value === settingsAfter?.value) {
    console.log('   🎉 SUCCESS! Both tables are now IN SYNC!');
    console.log(`   Both have value: ${siteAfter?.value}`);
  } else {
    console.log('   ❌ FAIL! Tables are OUT OF SYNC!');
    console.log(`   SiteSettings: ${siteAfter?.value}`);
    console.log(`   Settings:     ${settingsAfter?.value}`);
  }

  await prisma.$disconnect();
}

main();

/**
 * Diagnostic Script: Product Card Settings Issue
 * 
 * Tests the complete flow of product card visibility settings:
 * 1. Database values check
 * 2. API endpoint response
 * 3. Settings cache behavior
 * 4. Frontend component state
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnose() {
  console.log('🔍 Diagnosing Product Card Settings Issue\n');

  try {
    // Step 1: Check database values
    console.log('📊 Step 1: Checking database values...');
    const settingsKeys = [
      'product_card_showPrice',
      'product_card_showComparePrice',
      'product_card_showPartNumber',
      'product_card_showSku',
      'product_card_showBrand',
      'product_card_showOrigin',
      'product_card_showCategory',
      'product_card_showDescription',
      'product_card_showTags',
      'product_card_showStockStatus',
      'product_card_showDiscountBadge',
    ];

    const dbSettings = await prisma.siteSettings.findMany({
      where: {
        key: {
          in: settingsKeys
        }
      }
    });

    console.log('Database values:');
    console.table(dbSettings.map(s => ({
      Key: s.key,
      Value: s.value,
      Type: typeof s.value,
      UpdatedAt: s.updatedAt.toISOString()
    })));

    // Step 2: Test API endpoint
    console.log('\n🌐 Step 2: Testing API endpoint...');
    const apiResponse = await fetch('http://localhost:3000/api/public/product-card-settings');
    const apiData = await apiResponse.json();
    
    console.log('API Response:');
    console.log(JSON.stringify(apiData, null, 2));

    // Step 3: Check for type mismatches
    console.log('\n⚠️  Step 3: Checking for issues...');
    const issues: string[] = [];

    dbSettings.forEach(setting => {
      // Check if value is correct type
      const value = setting.value;
      if (typeof value !== 'string' && typeof value !== 'boolean') {
        issues.push(`❌ ${setting.key}: Invalid type (${typeof value})`);
      }

      // Check if string boolean values
      if (typeof value === 'string' && value !== 'true' && value !== 'false') {
        issues.push(`❌ ${setting.key}: String value is not 'true' or 'false' (got: "${value}")`);
      }
    });

    // Check for missing settings
    settingsKeys.forEach(key => {
      if (!dbSettings.find(s => s.key === key)) {
        issues.push(`⚠️  ${key}: Missing from database (will default to true)`);
      }
    });

    if (issues.length > 0) {
      console.log('\nIssues found:');
      issues.forEach(issue => console.log(issue));
    } else {
      console.log('\n✅ No issues found in database or API');
    }

    // Step 4: Check if API data matches database
    console.log('\n🔄 Step 4: Comparing API response to database...');
    if (apiData.success && apiData.data) {
      const apiSettings = apiData.data;
      const mismatches: string[] = [];

      Object.entries(apiSettings).forEach(([key, apiValue]) => {
        const dbKey = `product_card_${key}`;
        const dbSetting = dbSettings.find(s => s.key === dbKey);
        
        if (dbSetting) {
          const dbValue = dbSetting.value === 'true' || dbSetting.value === true;
          if (dbValue !== apiValue) {
            mismatches.push(`${key}: DB=${dbValue}, API=${apiValue}`);
          }
        }
      });

      if (mismatches.length > 0) {
        console.log('❌ Mismatches found:');
        mismatches.forEach(m => console.log(`   ${m}`));
      } else {
        console.log('✅ API data matches database');
      }
    }

    // Step 5: Recommendations
    console.log('\n💡 Recommendations:');
    console.log('1. Check browser console for ProductCard component logs');
    console.log('2. Verify ProductCard.tsx is using the settings correctly');
    console.log('3. Check for browser caching (hard refresh with Ctrl+Shift+R)');
    console.log('4. Ensure conditional rendering logic in ProductCard.tsx is correct');

  } catch (error) {
    console.error('Error during diagnosis:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();

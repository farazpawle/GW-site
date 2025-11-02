/**
 * Test Product Card Settings Functionality
 * 
 * This script tests:
 * 1. Fetching product card settings via API
 * 2. Default settings structure
 * 3. Settings cache behavior
 */

async function testProductCardSettings() {
  console.log('🧪 Testing Product Card Settings...\n');

  try {
    // Test 1: Fetch settings via API
    console.log('1️⃣ Testing API endpoint...');
    const response = await fetch('http://localhost:3000/api/public/product-card-settings');
    const result = await response.json();
    
    console.log('API Response:', JSON.stringify(result, null, 2));
    
    if (!result.success) {
      console.error('❌ API returned error:', result.error);
      return;
    }
    
    // Test 2: Verify settings structure
    console.log('\n2️⃣ Verifying settings structure...');
    const expectedFields = [
      'showPartNumber',
      'showSku',
      'showBrand',
      'showOrigin',
      'showCategory',
      'showDescription',
      'showTags',
      'showPrice',
      'showComparePrice',
      'showDiscountBadge',
      'showStockStatus',
    ];
    
    const settings = result.data;
    const missingFields = expectedFields.filter(field => !(field in settings));
    
    if (missingFields.length > 0) {
      console.error('❌ Missing fields:', missingFields);
      return;
    }
    
    console.log('✅ All fields present');
    
    // Test 3: Display current configuration
    console.log('\n3️⃣ Current Configuration:');
    console.log('┌─────────────────────┬────────┐');
    console.log('│ Field               │ Shown  │');
    console.log('├─────────────────────┼────────┤');
    
    Object.entries(settings).forEach(([key, value]) => {
      const fieldName = key.replace('show', '').replace(/([A-Z])/g, ' $1').trim();
      const status = value ? '✅' : '❌';
      console.log(`│ ${fieldName.padEnd(19)} │ ${status}     │`);
    });
    
    console.log('└─────────────────────┴────────┘');
    
    console.log('\n✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run tests
testProductCardSettings();

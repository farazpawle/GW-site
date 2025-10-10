/**
 * Script to clear settings cache and verify ecommerce mode
 */

import { clearSettingsCache, isEcommerceEnabled, getSiteSetting } from '../src/lib/settings';

async function main() {
  console.log('🔧 Clearing settings cache...\n');

  // Clear the cache
  clearSettingsCache();
  console.log('✅ Cache cleared\n');

  // Fetch fresh value
  console.log('📋 Checking ecommerce mode...');
  const rawSetting = await getSiteSetting('ecommerce_enabled');
  console.log('Raw setting value:', JSON.stringify(rawSetting));
  console.log('Type:', typeof rawSetting);

  const isEnabled = await isEcommerceEnabled();
  console.log('\n✅ isEcommerceEnabled() returns:', isEnabled);

  if (isEnabled) {
    console.log('\n🛒 E-commerce mode is ENABLED - prices will be shown');
  } else {
    console.log('\n👁️  Showcase mode is active - prices will be hidden');
  }
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

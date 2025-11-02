/**
 * Clear Settings Cache Script
 * 
 * This script makes an API call to trigger cache clearing
 */

async function clearCache() {
  console.log('🧹 Clearing settings cache...\n');

  try {
    // Make a request to the API endpoint which should clear cache on write
    // But first, let's just wait for cache to expire (60 seconds) or restart the server
    
    console.log('Option 1: Wait 60 seconds for cache to expire');
    console.log('Option 2: Restart the Next.js dev server');
    console.log('Option 3: Make a settings update via admin panel to trigger cache clear');
    console.log('\nChecking current API response...');
    
    const response = await fetch('http://localhost:3000/api/public/product-card-settings?_=' + Date.now());
    const data = await response.json();
    
    if (data.success) {
      console.log('\nCurrent settings:');
      console.log(JSON.stringify(data.data, null, 2));
      
      if (data.data.showBrand === false) {
        console.log('\n✅ Cache has been updated! Brand field should now be hidden.');
      } else {
        console.log('\n⏳ Cache still shows old values. Please:');
        console.log('   1. Restart the Next.js dev server, OR');
        console.log('   2. Wait 60 seconds and check again');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

clearCache();

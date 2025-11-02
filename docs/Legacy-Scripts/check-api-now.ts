/**
 * Check ACTUAL API Response Right Now
 */

async function checkAPI() {
  console.log('Checking API response...\n');
  
  const response = await fetch('http://localhost:3000/api/public/product-card-settings?_=' + Date.now());
  const data = await response.json();
  
  console.log('API Response:');
  console.log(JSON.stringify(data, null, 2));
  
  console.log('\n\nField Values:');
  Object.entries(data.data).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });
}

checkAPI();

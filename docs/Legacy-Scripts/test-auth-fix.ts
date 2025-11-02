/**
 * Test: Settings API Authorization Error Handling
 * 
 * This script tests that the settings API properly returns JSON error
 * instead of HTML when user is not authorized.
 */

async function testAuthError() {
  console.log('🧪 Testing Settings API Authorization...\n');

  try {
    // Test GET endpoint without authentication
    console.log('1️⃣ Testing GET /api/admin/settings');
    const getResponse = await fetch('http://localhost:3000/api/admin/settings');
    const getContentType = getResponse.headers.get('content-type');
    
    console.log(`   Status: ${getResponse.status}`);
    console.log(`   Content-Type: ${getContentType}`);
    
    if (getContentType?.includes('application/json')) {
      const data = await getResponse.json();
      console.log(`   ✅ Returns JSON:`, data);
    } else {
      const text = await getResponse.text();
      console.log(`   ❌ Returns HTML (first 100 chars):`, text.substring(0, 100));
    }

    console.log('\n2️⃣ Testing PUT /api/admin/settings');
    const putResponse = await fetch('http://localhost:3000/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site_name: 'Test' })
    });
    const putContentType = putResponse.headers.get('content-type');
    
    console.log(`   Status: ${putResponse.status}`);
    console.log(`   Content-Type: ${putContentType}`);
    
    if (putContentType?.includes('application/json')) {
      const data = await putResponse.json();
      console.log(`   ✅ Returns JSON:`, data);
    } else {
      const text = await putResponse.text();
      console.log(`   ❌ Returns HTML (first 100 chars):`, text.substring(0, 100));
    }

    console.log('\n✅ Test complete!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAuthError();

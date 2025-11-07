/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Test the products API to see what fields it's returning
 */

async function testAPI() {
  try {
    console.log('\n🔍 Testing Products API...\n');
    
    const response = await fetch('http://localhost:3000/api/public/showcase/products?limit=2');
    const data = await response.json();

    if (!data.success) {
      console.log('❌ API returned error');
      return;
    }

    console.log(`Mode: ${data.mode}`);
    console.log(`Total products: ${data.pagination.totalCount}\n`);

    data.data.forEach((product: any, idx: number) => {
      console.log(`\n📦 Product ${idx + 1}: ${product.name}`);
      console.log('─'.repeat(60));
      console.log(`  partNumber: ${product.partNumber || '❌ MISSING'}`);
      console.log(`  sku:        ${product.sku || '❌ MISSING'}`);
      console.log(`  brand:      ${product.brand || '❌ MISSING'}`);
      console.log(`  origin:     ${product.origin || '❌ MISSING'}`);
      console.log(`  category:   ${product.category ? JSON.stringify(product.category) : '❌ MISSING'}`);
      console.log(`  price:      ${product.price !== undefined ? product.price : '❌ MISSING'}`);
      console.log(`  tags:       ${product.tags ? product.tags.join(', ') : '❌ MISSING'}`);
      console.log(`  description: ${product.description ? product.description.substring(0, 40) + '...' : '❌ MISSING'}`);
    });

    console.log('\n✅ API test complete!\n');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure dev server is running: npm run dev\n');
  }
}

testAPI();

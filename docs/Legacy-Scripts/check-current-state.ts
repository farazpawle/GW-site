/**
 * Manual Test - Check Current State
 * Just reads what's in the database right now
 */

import { prisma } from '@/lib/prisma';

async function checkCurrentState() {
  console.log('🔍 Checking Current State\n');

  try {
    console.log('1️⃣ All product_card_* settings in database:');
    const settings = await prisma.siteSettings.findMany({
      where: {
        key: {
          startsWith: 'product_card_'
        }
      },
      orderBy: {
        key: 'asc'
      }
    });

    if (settings.length === 0) {
      console.log('❌ No product_card_* settings found!');
    } else {
      console.log(`Found ${settings.length} settings:\n`);
      settings.forEach(s => {
        console.log(`   ${s.key}: ${JSON.stringify(s.value)}`);
      });
    }

    console.log('\n2️⃣ What the API returns:');
    const response = await fetch('http://localhost:3000/api/public/product-card-settings');
    const result = await response.json();
    
    console.log(JSON.stringify(result.data, null, 2));

    console.log('\n3️⃣ Instructions:');
    console.log('   - Go to Admin → Settings → Product Card');
    console.log('   - Toggle OFF "Country of Origin"');
    console.log('   - Click "Save Changes"');
    console.log('   - Run this script again to see if it saved');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentState();

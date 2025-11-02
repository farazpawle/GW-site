/**
 * Quick Test: Verify Current Settings State
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSettings() {
  console.log('📊 Current Product Card Settings\n');

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

  console.log('Database Values:');
  console.table(settings.map(s => ({
    Field: s.key.replace('product_card_show', ''),
    Visible: s.value === 'true' ? '✅ YES' : '❌ NO',
    Value: s.value
  })));

  console.log('\nAPI Response:');
  const response = await fetch('http://localhost:3000/api/public/product-card-settings?_=' + Date.now());
  const data = await response.json();
  
  if (data.success) {
    console.table(Object.entries(data.data).map(([key, value]) => ({
      Field: key.replace('show', ''),
      Visible: value ? '✅ YES' : '❌ NO'
    })));
  }

  await prisma.$disconnect();
}

checkSettings();

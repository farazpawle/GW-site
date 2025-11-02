import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('\n📊 Checking which table has product_card_* settings...\n');

  // Check SiteSettings table
  const siteSettings = await prisma.siteSettings.findMany({
    where: {
      key: {
        startsWith: 'product_card_'
      }
    }
  });

  console.log('📦 SiteSettings table:');
  if (siteSettings.length === 0) {
    console.log('   ❌ No product_card_* settings found');
  } else {
    siteSettings.forEach(s => {
      console.log(`   ${s.key} = ${JSON.stringify(s.value)}`);
    });
  }

  // Check Settings table
  const settings = await prisma.settings.findMany({
    where: {
      key: {
        startsWith: 'product_card_'
      }
    }
  });

  console.log('\n⚙️  Settings table:');
  if (settings.length === 0) {
    console.log('   ❌ No product_card_* settings found');
  } else {
    settings.forEach(s => {
      console.log(`   ${s.key} = ${s.value}`);
    });
  }

  await prisma.$disconnect();
}

main();

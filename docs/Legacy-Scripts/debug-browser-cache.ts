/**
 * Debug: Check What Browser Sees
 * This creates a simple test page to verify settings
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugCheck() {
  console.log('🔍 DEBUG CHECK\n');
  console.log('═══════════════════════════════════════\n');

  // Check database
  console.log('1️⃣ Database Values:');
  const dbSettings = await prisma.siteSettings.findMany({
    where: { key: { startsWith: 'product_card_' } },
    orderBy: { key: 'asc' }
  });
  
  console.table(dbSettings.map(s => ({
    Field: s.key.replace('product_card_show', ''),
    Value: s.value
  })));

  // Check API
  console.log('\n2️⃣ API Response:');
  const apiRes = await fetch('http://localhost:3000/api/public/product-card-settings?_=' + Date.now());
  const apiData = await apiRes.json();
  console.log(JSON.stringify(apiData.data, null, 2));

  console.log('\n═══════════════════════════════════════');
  console.log('3️⃣ CRITICAL STEPS TO FIX:\n');
  console.log('The component code has changed. You MUST:');
  console.log('');
  console.log('✅ RESTART Next.js dev server:');
  console.log('   - Press Ctrl+C in the terminal running "npm run dev"');
  console.log('   - Run "npm run dev" again');
  console.log('   - Wait for "Ready" message');
  console.log('');
  console.log('✅ Clear browser cache:');
  console.log('   - Close ALL browser tabs');
  console.log('   - Reopen browser');
  console.log('   - OR use Incognito/Private window');
  console.log('');
  console.log('✅ Hard refresh page:');
  console.log('   - Press Ctrl+Shift+R (or Cmd+Shift+R on Mac)');
  console.log('   - Do this 2-3 times');
  console.log('');
  console.log('The old component code is cached in your browser!');
  console.log('═══════════════════════════════════════\n');

  await prisma.$disconnect();
}

debugCheck();

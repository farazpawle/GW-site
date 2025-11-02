import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Verifying Phase 5 Implementation...\n')

  // 1. Check Pages
  console.log('1️⃣ Testing Pages...')
  const pages = await prisma.page.findMany()
  console.log(`   ✓ Found ${pages.length} page(s)`)
  if (pages.length > 0) {
    console.log(`   ✓ First page: "${pages[0].title}" (${pages[0].slug})`)
  }

  // 2. Check Menu Items
  console.log('\n2️⃣ Testing Menu Items...')
  const menuItems = await prisma.menuItem.findMany({
    include: {
      page: true,
      parent: true,
      children: true
    }
  })
  console.log(`   ✓ Found ${menuItems.length} menu item(s)`)
  menuItems.forEach(item => {
    const link = item.pageId ? `→ Page: ${item.page?.title}` : `→ URL: ${item.externalUrl}`
    console.log(`   ✓ "${item.label}" (pos: ${item.position}) ${link}`)
  })

  // 3. Check Collections
  console.log('\n3️⃣ Testing Collections...')
  const collections = await prisma.collection.findMany()
  console.log(`   ✓ Found ${collections.length} collection(s)`)
  if (collections.length > 0) {
    console.log(`   ✓ First collection: "${collections[0].name}" (${collections[0].slug})`)
    console.log(`   ✓ Filter rules:`, JSON.stringify(collections[0].filterRules))
  }

  // 4. Check Parts (existing functionality)
  console.log('\n4️⃣ Testing Existing Parts...')
  const parts = await prisma.part.findMany({
    take: 5,
    select: {
      id: true,
      name: true,
      partNumber: true,
      price: true,
      // Phase 5 fields (only those that exist in current schema)
      sku: true,
      hasVariants: true,
      compareAtPrice: true,
      stockQuantity: true,
      inStock: true,
    }
  })
  console.log(`   ✓ Found ${parts.length} part(s) (showing first 5)`)
  parts.forEach(part => {
    console.log(`   ✓ ${part.name} - $${part.price} (SKU: ${part.sku || 'N/A'}, Stock: ${part.stockQuantity}, In Stock: ${part.inStock})`)
  })

  // 5. Check Product Variants
  console.log('\n5️⃣ Testing Product Variants...')
  const variants = await prisma.productVariant.findMany()
  console.log(`   ✓ Found ${variants.length} variant(s)`)

  // 6. Test Category Relations (backward compatibility)
  console.log('\n6️⃣ Testing Category Relations (Backward Compatibility)...')
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { parts: true }
      }
    }
  })
  console.log(`   ✓ Found ${categories.length} category(ies)`)
  categories.forEach(cat => {
    console.log(`   ✓ ${cat.name}: ${cat._count.parts} product(s)`)
  })

  console.log('\n✅ Phase 5 PART 1 Verification Complete!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Summary:')
  console.log(`  • Pages: ${pages.length}`)
  console.log(`  • Menu Items: ${menuItems.length}`)
  console.log(`  • Collections: ${collections.length}`)
  console.log(`  • Parts: ${parts.length}`)
  console.log(`  • Variants: ${variants.length}`)
  console.log(`  • Categories: ${categories.length}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch((e) => {
    console.error('❌ Verification failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

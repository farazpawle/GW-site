import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProduct() {
  try {
    // Check all products
    const allProducts = await prisma.part.findMany({
      select: { id: true, name: true, slug: true, published: true }
    });
    
    console.log(`\nTotal products in database: ${allProducts.length}`);
    console.log(`Published products: ${allProducts.filter(p => p.published).length}`);
    console.log(`Unpublished products: ${allProducts.filter(p => !p.published).length}`);
    
    // Find a published product
    const product = await prisma.part.findFirst({
      where: { published: true },
      select: { slug: true, name: true, partNumber: true, id: true, published: true }
    });
    
    console.log('\nFirst published product:', product);
    
    if (product) {
      console.log(`\nTest URL: http://localhost:3000/products/${product.slug}`);
    } else {
      console.log('\n❌ No published products found!');
      console.log('✅ Fix: You need to publish some products from the admin panel');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProduct();

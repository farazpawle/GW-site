import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProductData() {
  try {
    const product = await prisma.part.findFirst({
      where: { published: true },
      include: {
        category: true,
        crossReferences: {
          include: {
            referencedPart: true,
          },
        },
        oemPartNumbers: true,
        vehicleCompatibility: true,
      },
    });

    if (!product) {
      console.log('No published products found');
      return;
    }

    console.log('\n📦 Product Data Overview:\n');
    console.log('═'.repeat(60));
    
    console.log('\n🔵 Basic Info:');
    console.log(`  Name: ${product.name}`);
    console.log(`  Part Number: ${product.partNumber}`);
    console.log(`  SKU: ${product.sku}`);
    console.log(`  Slug: ${product.slug}`);
    
    console.log('\n🔵 Showcase Fields:');
    console.log(`  Published: ${product.published}`);
    console.log(`  Featured: ${product.featured}`);
    console.log(`  Tags: ${product.tags.length > 0 ? product.tags.join(', ') : 'None'}`);
    console.log(`  Brand: ${product.brand || 'Not set'}`);
    console.log(`  Origin: ${product.origin || 'Not set'}`);
    console.log(`  Certifications: ${product.certifications.length > 0 ? product.certifications.join(', ') : 'None'}`);
    console.log(`  Warranty: ${product.warranty || 'Not set'}`);
    console.log(`  Difficulty: ${product.difficulty || 'Not set'}`);
    console.log(`  Application: ${product.application.length > 0 ? product.application.join(', ') : 'None'}`);
    console.log(`  Video URL: ${product.videoUrl || 'Not set'}`);
    console.log(`  PDF URL: ${product.pdfUrl || 'Not set'}`);
    console.log(`  Views: ${product.views}`);
    console.log(`  Showcase Order: ${product.showcaseOrder}`);
    
    console.log('\n🔵 Content:');
    console.log(`  Description: ${product.description ? `${product.description.substring(0, 50)}...` : 'Not set'}`);
    console.log(`  Short Desc: ${product.shortDesc || 'Not set'}`);
    
    console.log('\n🔵 Images:');
    console.log(`  Images Count: ${product.images.length}`);
    if (product.images.length > 0) {
      product.images.forEach((img, i) => {
        console.log(`    ${i + 1}. ${img}`);
      });
    }
    
    console.log('\n🔵 Pricing:');
    console.log(`  Price: $${product.price}`);
    console.log(`  Compare Price: ${product.comparePrice ? `$${product.comparePrice}` : 'Not set'}`);
    console.log(`  Compare At Price: ${product.compareAtPrice ? `$${product.compareAtPrice}` : 'Not set'}`);
    
    console.log('\n🔵 Inventory:');
    console.log(`  In Stock: ${product.inStock}`);
    console.log(`  Stock Quantity: ${product.stockQuantity}`);
    console.log(`  Has Variants: ${product.hasVariants}`);
    
    console.log('\n🔵 Category:');
    console.log(`  Name: ${product.category.name}`);
    console.log(`  Slug: ${product.category.slug}`);
    
    console.log('\n🔵 Specifications:');
    if (product.specifications && typeof product.specifications === 'object') {
      const specs = product.specifications as Record<string, unknown>;
      const specKeys = Object.keys(specs);
      console.log(`  Count: ${specKeys.length}`);
      if (specKeys.length > 0) {
        specKeys.forEach(key => {
          console.log(`    ${key}: ${specs[key]}`);
        });
      }
    } else {
      console.log('  None set');
    }
    
    console.log('\n🔵 Compatibility:');
    console.log(`  Compatibility Strings: ${product.compatibility.length}`);
    if (product.compatibility.length > 0) {
      product.compatibility.forEach((c, i) => {
        console.log(`    ${i + 1}. ${c}`);
      });
    }
    
    console.log('\n🔵 Cross-References:');
    console.log(`  Count: ${product.crossReferences.length}`);
    
    console.log('\n🔵 OEM Part Numbers:');
    console.log(`  Count: ${product.oemPartNumbers.length}`);
    
    console.log('\n🔵 Vehicle Compatibility:');
    console.log(`  Count: ${product.vehicleCompatibility.length}`);
    
    console.log('\n' + '═'.repeat(60));
    console.log(`\n🌐 View this product at: http://localhost:3000/products/${product.slug}\n`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProductData();

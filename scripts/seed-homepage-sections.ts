/**
 * Seed script for homepage sections
 * 
 * This script populates the database with default homepage sections
 * using the current hardcoded content from section components.
 * 
 * Usage: npx ts-node scripts/seed-homepage-sections.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding homepage sections...');

  // Find or create the homepage
  let homepage = await prisma.page.findFirst({
    where: {
      OR: [
        { slug: 'home' },
        { slug: 'homepage' },
        { pageType: 'home' }
      ]
    }
  });

  if (!homepage) {
    console.log('📄 Creating homepage...');
    homepage = await prisma.page.create({
      data: {
        title: 'Home',
        slug: 'home',
        pageType: 'home',
        published: true,
        publishedAt: new Date(),
        isPermanent: true,
        description: 'Garrit & Wulf - Premium Auto Parts',
        metaTitle: 'Garrit & Wulf - Premium Auto Parts for European, American & Truck Vehicles',
        metaDesc: 'Quality European, American Vehicle & Truck Parts'
      }
    });
    console.log('✅ Homepage created with ID:', homepage.id);
  } else {
    console.log('✅ Found existing homepage with ID:', homepage.id);
  }

  // Delete existing sections for this page (if any)
  const deleted = await prisma.pageSection.deleteMany({
    where: { pageId: homepage.id }
  });
  
  if (deleted.count > 0) {
    console.log(`🗑️  Deleted ${deleted.count} existing sections`);
  }

  // Define default sections with extracted content
  const defaultSections = [
    {
      sectionType: 'hero',
      position: 0,
      visible: true,
      config: {
        badge: {
          text: 'Premium Auto Parts',
          icon: 'sparkles'
        },
        title: {
          line1: 'Transform Your Drive with',
          line2: 'Superior Parts'
        },
        description: 'Quality European, American Vehicle & Truck Parts',
        primaryCTA: {
          show: false,
          text: 'Shop Now',
          link: '/products'
        },
        secondaryCTA: {
          show: false,
          text: 'Learn More',
          link: '/about'
        },
        statistics: {
          show: true,
          stats: [
            { value: 5000, suffix: '+', label: 'LINE ITEMS' },
            { value: 15, suffix: '+', label: 'YEARS EXPERIENCE' },
            { value: 100, suffix: '%', label: 'TRUSTWORTHY PARTS' }
          ]
        }
      }
    },
    {
      sectionType: 'brandStory',
      position: 1,
      visible: true,
      config: {
        title: 'Our Brand Story',
        subtitle: 'Driving Innovation in Auto Parts',
        content: [
          'Garrit & Wulf began with a vision to revolutionize the auto parts industry. Our passion for precision and dedication to quality have transformed humble beginnings into a legacy of innovation.',
          'We craft every part with meticulous attention to detail to ensure reliability and performance for European, American, and heavy-duty trucks. Our story is one of resilience, creativity, and continuous improvement.'
        ],
        cta: {
          show: true,
          text: 'Discover More',
          link: '/about'
        },
        features: {
          show: true,
          items: [
            {
              icon: 'Shield',
              title: 'Quality Assurance',
              description: 'Every component undergoes rigorous testing for maximum reliability'
            },
            {
              icon: 'Zap',
              title: 'Innovation Driven',
              description: 'Cutting-edge technology and continuous improvement'
            },
            {
              icon: 'Award',
              title: 'Industry Leader',
              description: '15+ years of excellence and trusted partnerships'
            }
          ]
        }
      }
    },
    {
      sectionType: 'carousel',
      position: 2,
      visible: true,
      config: {
        heading: 'Trusted by Industry Leaders',
        description: 'Collaborating with world-class organizations to deliver excellence in precision manufacturing',
        speed: 0.5,
        itemsPerView: {
          mobile: 2,
          tablet: 3,
          desktop: 5
        },
        logos: [
          {
            id: 'logo-1',
            description: 'Partner Brand 1',
            altText: 'Partner Brand 1 Logo',
            image: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=300&h=120&fit=crop',
            isActive: true,
            order: 0
          },
          {
            id: 'logo-2',
            description: 'Partner Brand 2',
            altText: 'Partner Brand 2 Logo',
            image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=300&h=120&fit=crop',
            isActive: true,
            order: 1
          },
          {
            id: 'logo-3',
            description: 'Partner Brand 3',
            altText: 'Partner Brand 3 Logo',
            image: 'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=300&h=120&fit=crop',
            isActive: true,
            order: 2
          },
          {
            id: 'logo-4',
            description: 'Partner Brand 4',
            altText: 'Partner Brand 4 Logo',
            image: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=300&h=120&fit=crop',
            isActive: true,
            order: 3
          },
          {
            id: 'logo-5',
            description: 'Partner Brand 5',
            altText: 'Partner Brand 5 Logo',
            image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=300&h=120&fit=crop',
            isActive: true,
            order: 4
          },
          {
            id: 'logo-6',
            description: 'Partner Brand 6',
            altText: 'Partner Brand 6 Logo',
            image: 'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=300&h=120&fit=crop',
            isActive: true,
            order: 5
          }
        ]
      }
    },
    {
      sectionType: 'categories',
      position: 3,
      visible: true,
      config: {
        title: 'Our Categories',
        description: 'Comprehensive range of premium auto parts for all your vehicle needs',
        show: true,
        accentColor: '#6e0000',
        backgroundPattern: true,
        gridColumns: 3,
        cardStyle: 'boxed',
        iconPosition: 'top',
        categories: [
          {
            icon: 'Car',
            title: 'European Parts',
            description: 'Precision-engineered components tailored for European vehicles.',
            isActive: true,
            order: 0,
            backgroundImage: '',
            cta: {
              show: false,
              text: 'View Products',
              link: '#'
            }
          },
          {
            icon: 'Cog',
            title: 'American Parts',
            description: 'Reliable, high-performance parts for American cars and SUVs.',
            isActive: true,
            order: 1,
            backgroundImage: '',
            cta: {
              show: false,
              text: 'View Products',
              link: '#'
            }
          },
          {
            icon: 'Truck',
            title: 'Truck Parts',
            description: 'Robust components built to support heavy-duty truck applications.',
            isActive: true,
            order: 2,
            backgroundImage: '',
            cta: {
              show: false,
              text: 'View Products',
              link: '#'
            }
          }
        ]
      }
    },
    {
      sectionType: 'precisionMfg',
      position: 4,
      visible: true,
      config: {
        title: 'Precision-Manufactured Auto Parts',
        description: 'Crafted with cutting-edge technology and rigorous quality control to ensure peak performance',
        show: true,
        accentColor: '#6e0000',
        gridColumns: 4,
        cardStyle: 'standard',
        ctaStyle: 'solid',
        badge: {
          show: true,
          position: 'top-right'
        },
        services: [
          {
            title: 'Engine Components',
            description: 'High-performance parts for various engine types.',
            image: '/images/engine.jpg',
            altText: 'High-performance engine components',
            badgeText: 'Premium',
            isActive: true,
            order: 0,
            cta: {
              show: true,
              text: 'LEARN MORE',
              link: '#'
            }
          },
          {
            title: 'Transmission Parts',
            description: 'Durable components for smooth gear shifting.',
            image: '/images/transmision.jpeg',
            altText: 'Durable transmission parts',
            badgeText: 'Premium',
            isActive: true,
            order: 1,
            cta: {
              show: true,
              text: 'LEARN MORE',
              link: '#'
            }
          },
          {
            title: 'Braking Systems',
            description: 'Reliable parts for enhanced safety.',
            image: '/images/brake.jpg',
            altText: 'Reliable braking system components',
            badgeText: 'Premium',
            isActive: true,
            order: 2,
            cta: {
              show: true,
              text: 'LEARN MORE',
              link: '#'
            }
          },
          {
            title: 'Electrical Components',
            description: 'Advanced parts for modern vehicles.',
            image: '/images/elec-com-e1740055106227.jpeg',
            altText: 'Advanced electrical components',
            badgeText: 'Premium',
            isActive: true,
            order: 3,
            cta: {
              show: true,
              text: 'LEARN MORE',
              link: '#'
            }
          }
        ]
      }
    }
  ];

  // Create sections
  console.log(`📦 Creating ${defaultSections.length} sections...`);
  
  for (const section of defaultSections) {
    await prisma.pageSection.create({
      data: {
        pageId: homepage.id,
        sectionType: section.sectionType,
        position: section.position,
        visible: section.visible,
        config: section.config
      }
    });
    
    console.log(`  ✅ Created ${section.sectionType} section at position ${section.position}`);
  }

  console.log('\n🎉 Seeding completed successfully!');
  console.log(`\nHomepage sections created for page: "${homepage.title}" (${homepage.slug})`);
  console.log(`Total sections: ${defaultSections.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding homepage sections:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

/**
 * Phase 9: Site Settings Seed Script
 * 
 * Seeds default settings covering 4 categories:
 * - GENERAL: Site branding and configuration
 * - CONTACT: Contact information and business hours
 * - SEO: Search engine optimization
 * - SHIPPING: Shipping rules and costs
 * 
 * This script is idempotent - running multiple times won't create duplicates.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type SettingsCategory = 'GENERAL' | 'CONTACT' | 'SEO' | 'SHIPPING';

interface DefaultSetting {
  key: string;
  value: string;
  category: SettingsCategory;
}

const defaultSettings: DefaultSetting[] = [
  // ============================================================
  // GENERAL CATEGORY (5 settings)
  // ============================================================
  {
    key: 'site_name',
    value: 'Garrit Wulf Auto Parts',
    category: 'GENERAL',
  },
  {
    key: 'site_tagline',
    value: 'Premium Automotive Parts & Accessories',
    category: 'GENERAL',
  },
  {
    key: 'logo_url',
    value: '/images/logo.png',
    category: 'GENERAL',
  },
  {
    key: 'timezone',
    value: 'Asia/Dubai',
    category: 'GENERAL',
  },
  {
    key: 'currency',
    value: 'AED',
    category: 'GENERAL',
  },

  // ============================================================
  // CONTACT CATEGORY (8 settings)
  // ============================================================
  {
    key: 'contact_email',
    value: 'info@garritwulf.com',
    category: 'CONTACT',
  },
  {
    key: 'contact_phone',
    value: '+971 4 123 4567',
    category: 'CONTACT',
  },
  {
    key: 'contact_address',
    value: 'Dubai, United Arab Emirates',
    category: 'CONTACT',
  },
  {
    key: 'business_hours',
    value: 'Sunday - Thursday: 9:00 AM - 6:00 PM',
    category: 'CONTACT',
  },
  {
    key: 'social_facebook',
    value: 'https://facebook.com/garritwulf',
    category: 'CONTACT',
  },
  {
    key: 'social_instagram',
    value: 'https://instagram.com/garritwulf',
    category: 'CONTACT',
  },
  {
    key: 'social_twitter',
    value: 'https://twitter.com/garritwulf',
    category: 'CONTACT',
  },
  {
    key: 'social_linkedin',
    value: 'https://linkedin.com/company/garritwulf',
    category: 'CONTACT',
  },

  // ============================================================
  // SEO CATEGORY (6 settings)
  // ============================================================
  {
    key: 'seo_title',
    value: 'Garrit Wulf - Premium Auto Parts & Accessories',
    category: 'SEO',
  },
  {
    key: 'seo_description',
    value: 'Shop premium automotive parts and accessories at Garrit Wulf. Quality products for all vehicle makes and models.',
    category: 'SEO',
  },
  {
    key: 'seo_keywords',
    value: 'auto parts, car accessories, automotive parts, vehicle parts, Dubai auto parts',
    category: 'SEO',
  },
  {
    key: 'seo_og_image',
    value: '/images/og-image.jpg',
    category: 'SEO',
  },
  {
    key: 'google_analytics_id',
    value: '',
    category: 'SEO',
  },
  {
    key: 'google_tag_manager_id',
    value: '',
    category: 'SEO',
  },

  // ============================================================
  // FAVICON CATEGORY (5 settings)
  // ============================================================
  {
    key: 'favicon_ico',
    value: '/favicon.ico',
    category: 'SEO',
  },
  {
    key: 'favicon_16',
    value: '',
    category: 'SEO',
  },
  {
    key: 'favicon_32',
    value: '',
    category: 'SEO',
  },
  {
    key: 'favicon_192',
    value: '',
    category: 'SEO',
  },
  {
    key: 'apple_touch_icon',
    value: '',
    category: 'SEO',
  },

  // ============================================================
  // SHIPPING CATEGORY (4 settings)
  // ============================================================
  {
    key: 'shipping_enabled',
    value: 'true',
    category: 'SHIPPING',
  },
  {
    key: 'shipping_flat_rate',
    value: '50.00',
    category: 'SHIPPING',
  },
  {
    key: 'shipping_free_over',
    value: '500.00',
    category: 'SHIPPING',
  },
  {
    key: 'shipping_international',
    value: 'false',
    category: 'SHIPPING',
  },
];

/**
 * Seed settings with idempotent upsert pattern
 * Can be run multiple times without creating duplicates
 */
export async function seedSettings() {
  console.log('\n🌱 Seeding settings...');
  
  let created = 0;
  let updated = 0;

  for (const setting of defaultSettings) {
    try {
      const result = await prisma.settings.upsert({
        where: { key: setting.key },
        update: {
          value: setting.value,
          category: setting.category,
        },
        create: {
          key: setting.key,
          value: setting.value,
          category: setting.category,
        }
      });

      // Check if it was newly created or updated
      const wasCreated = result.createdAt.getTime() === result.updatedAt.getTime();
      if (wasCreated) {
        created++;
        console.log(`  ✅ Created: ${setting.key} (${setting.category})`);
      } else {
        updated++;
        console.log(`  🔄 Updated: ${setting.key} (${setting.category})`);
      }
    } catch (error) {
      console.error(`  ❌ Failed to seed ${setting.key}:`, error);
    }
  }

  console.log(`\n✅ Settings seeded successfully!`);
  console.log(`   📊 Created: ${created}`);
  console.log(`   📊 Updated: ${updated}`);
  console.log(`   📊 Total: ${defaultSettings.length}`);
  
  // Category breakdown
  const categories = defaultSettings.reduce((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('\n📂 Category Breakdown:');
  Object.entries(categories).forEach(([category, count]) => {
    console.log(`   ${category}: ${count} settings`);
  });
}

// Main execution when run directly
if (require.main === module) {
  seedSettings()
    .then(() => {
      console.log('\n✅ Seed completed successfully!\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Seed failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

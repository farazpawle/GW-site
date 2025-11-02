/**
 * Migration script to convert Collection.manualProductIds to CollectionProduct relation
 * Run this before applying the schema migration
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateCollectionProducts() {
  console.log('Starting Collection product migration...');

  try {
    // Get all collections with manualProductIds
    const collections = await prisma.$queryRaw<Array<{
      id: string;
      name: string;
      manualProductIds: string[];
    }>>`
      SELECT id, name, "manualProductIds"
      FROM collections
      WHERE "manualProductIds" IS NOT NULL AND array_length("manualProductIds", 1) > 0
    `;

    console.log(`Found ${collections.length} collections with manual products`);

    for (const collection of collections) {
      console.log(`\nMigrating collection: ${collection.name}`);
      console.log(`  Product IDs: ${collection.manualProductIds.join(', ')}`);

      // For each product ID, we'll insert into collection_products after the table is created
      // For now, just log the data
      console.log(`  Will create ${collection.manualProductIds.length} collection_products records`);
    }

    console.log('\nMigration data collected. Ready to proceed with schema migration.');
    console.log('Run: npx prisma migrate dev --name fix_collection_relations');

  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateCollectionProducts();

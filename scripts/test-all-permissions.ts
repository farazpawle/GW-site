/**
 * Comprehensive RBAC Test - All Features
 * Tests permission enforcement across all admin features
 */

import { PrismaClient } from '@prisma/client';
import { hasPermission } from '../src/lib/rbac/check-permission';

const prisma = new PrismaClient();

async function testAllPermissions(email: string) {
  console.log('\n🔒 COMPREHENSIVE RBAC TEST\n');
  console.log('=' .repeat(70));
  
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return;
    }

    console.log(`\n📧 User: ${user.email}`);
    console.log(`🎭 Role: ${user.role}`);
    console.log(`🔑 Custom Permissions: ${user.permissions.length} permissions\n`);

    // Test all feature permissions
    const features = [
      {
        name: 'Products (Parts)',
        permissions: [
          { action: 'products.view', desc: 'View products list' },
          { action: 'products.create', desc: 'Create new products' },
          { action: 'products.edit', desc: 'Edit existing products' },
          { action: 'products.delete', desc: 'Delete products' },
        ],
      },
      {
        name: 'Categories',
        permissions: [
          { action: 'categories.view', desc: 'View categories list' },
          { action: 'categories.create', desc: 'Create new categories' },
          { action: 'categories.edit', desc: 'Edit categories' },
          { action: 'categories.delete', desc: 'Delete categories' },
        ],
      },
      {
        name: 'Pages',
        permissions: [
          { action: 'pages.view', desc: 'View pages list' },
          { action: 'pages.create', desc: 'Create new pages' },
          { action: 'pages.edit', desc: 'Edit pages' },
          { action: 'pages.delete', desc: 'Delete pages' },
        ],
      },
      {
        name: 'Menu',
        permissions: [
          { action: 'menu.view', desc: 'View menu items' },
          { action: 'menu.create', desc: 'Create menu items' },
          { action: 'menu.edit', desc: 'Edit menu items' },
          { action: 'menu.delete', desc: 'Delete menu items' },
        ],
      },
      {
        name: 'Media',
        permissions: [
          { action: 'media.view', desc: 'View media files' },
          { action: 'media.upload', desc: 'Upload media' },
          { action: 'media.delete', desc: 'Delete media' },
        ],
      },
      {
        name: 'Messages',
        permissions: [
          { action: 'messages.view', desc: 'View messages' },
          { action: 'messages.edit', desc: 'Update messages' },
          { action: 'messages.delete', desc: 'Delete messages' },
        ],
      },
      {
        name: 'Homepage CMS',
        permissions: [
          { action: 'homepage.view', desc: 'View homepage sections' },
          { action: 'homepage.edit', desc: 'Edit homepage sections' },
        ],
      },
    ];

    features.forEach(feature => {
      console.log(`\n📁 ${feature.name}`);
      console.log('─'.repeat(70));
      
      feature.permissions.forEach(({ action, desc }) => {
        const allowed = hasPermission(user, action);
        const icon = allowed ? '✅' : '❌';
        const status = allowed ? 'ALLOWED' : 'DENIED';
        console.log(`${icon} ${action.padEnd(25)} ${status.padEnd(10)} ${desc}`);
      });
    });

    // Summary
    console.log('\n' + '=' .repeat(70));
    console.log('\n📊 PERMISSION SUMMARY:\n');

    const allPermissions = features.flatMap(f => f.permissions.map(p => p.action));
    const allowed = allPermissions.filter(p => hasPermission(user, p));
    const denied = allPermissions.filter(p => !hasPermission(user, p));

    console.log(`Total Permissions Tested: ${allPermissions.length}`);
    console.log(`✅ Allowed: ${allowed.length}`);
    console.log(`❌ Denied: ${denied.length}`);

    if (denied.length > 0) {
      console.log(`\n🔒 You are restricted from:`);
      denied.forEach(p => console.log(`   - ${p}`));
    }

    // API Route Summary
    console.log('\n' + '=' .repeat(70));
    console.log('\n🛡️  API PROTECTION STATUS:\n');

    const routes = [
      { method: 'GET', path: '/api/admin/parts', permission: 'products.view' },
      { method: 'POST', path: '/api/admin/parts', permission: 'products.create' },
      { method: 'PUT', path: '/api/admin/parts/[id]', permission: 'products.edit' },
      { method: 'DELETE', path: '/api/admin/parts/[id]', permission: 'products.delete' },
      { method: 'GET', path: '/api/admin/categories', permission: 'categories.view' },
      { method: 'POST', path: '/api/admin/categories', permission: 'categories.create' },
      { method: 'GET', path: '/api/admin/pages', permission: 'pages.view' },
      { method: 'POST', path: '/api/admin/pages', permission: 'pages.create' },
      { method: 'GET', path: '/api/admin/menu-items', permission: 'menu.view' },
      { method: 'POST', path: '/api/admin/menu-items', permission: 'menu.create' },
      { method: 'POST', path: '/api/admin/media/upload', permission: 'media.upload' },
      { method: 'GET', path: '/api/admin/media/files', permission: 'media.view' },
      { method: 'GET', path: '/api/admin/messages', permission: 'messages.view' },
      { method: 'PATCH', path: '/api/admin/messages/[id]', permission: 'messages.edit' },
      { method: 'GET', path: '/api/admin/page-sections', permission: 'homepage.view' },
      { method: 'POST', path: '/api/admin/page-sections', permission: 'homepage.edit' },
    ];

    const blockedRoutes: string[] = [];
    const allowedRoutes: string[] = [];

    routes.forEach(route => {
      const canAccess = hasPermission(user, route.permission);
      const status = canAccess ? '✅ Accessible' : '❌ Blocked (403)';
      console.log(`${route.method.padEnd(7)} ${route.path.padEnd(40)} ${status}`);
      
      if (canAccess) {
        allowedRoutes.push(`${route.method} ${route.path}`);
      } else {
        blockedRoutes.push(`${route.method} ${route.path}`);
      }
    });

    console.log(`\n📈 ${allowedRoutes.length}/${routes.length} routes accessible`);
    console.log(`🔒 ${blockedRoutes.length}/${routes.length} routes blocked`);

    console.log('\n' + '=' .repeat(70));
    console.log('\n✅ RBAC TEST COMPLETE\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run test
const email = process.argv[2] || 'farazkhld@gmail.com';
testAllPermissions(email);

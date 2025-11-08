/**
 * Batch update all admin API routes to use proper RBAC permission checks
 * 
 * This script will:
 * 1. Replace checkAdmin() with checkPermission()
 * 2. Add proper permission strings for each resource
 * 3. Keep existing authentication logic intact
 */

import * as fs from 'fs';
import * as path from 'path';

const API_ROOT = path.join(process.cwd(), 'src', 'app', 'api', 'admin');

// Permission mapping for each resource
const PERMISSION_MAP = {
  // Parts (Products)
  'parts/route.ts': {
    GET: 'products.view',
    POST: 'products.create',
  },
  'parts/[id]/route.ts': {
    GET: 'products.view',
    PUT: 'products.edit',
    DELETE: 'products.delete',
  },
  
  // Categories
  'categories/route.ts': {
    GET: 'categories.view',
    POST: 'categories.create',
  },
  'categories/[id]/route.ts': {
    GET: 'categories.view',
    PUT: 'categories.edit',
    DELETE: 'categories.delete',
  },
  
  // Pages
  'pages/route.ts': {
    GET: 'pages.view',
    POST: 'pages.create',
  },
  'pages/[id]/route.ts': {
    GET: 'pages.view',
    PUT: 'pages.edit',
    DELETE: 'pages.delete',
  },
  
  // Menu Items
  'menu-items/route.ts': {
    GET: 'menu.view',
    POST: 'menu.create',
  },
  'menu-items/[id]/route.ts': {
    GET: 'menu.view',
    PUT: 'menu.edit',
    DELETE: 'menu.delete',
  },
  'menu-items/reorder/route.ts': {
    PATCH: 'menu.edit',
  },
  
  // Media
  'media/upload/route.ts': {
    POST: 'media.upload',
  },
  'media/files/route.ts': {
    GET: 'media.view',
  },
  'media/[key]/route.ts': {
    DELETE: 'media.delete',
  },
  
  // Messages
  'messages/route.ts': {
    GET: 'messages.view',
  },
  'messages/[id]/route.ts': {
    GET: 'messages.view',
    PATCH: 'messages.edit',
    DELETE: 'messages.delete',
  },
};

interface UpdateResult {
  file: string;
  success: boolean;
  changes: string[];
  errors: string[];
}

const results: UpdateResult[] = [];

function updateFile(relativePath: string, permissions: Record<string, string>): UpdateResult {
  const result: UpdateResult = {
    file: relativePath,
    success: false,
    changes: [],
    errors: [],
  };

  const fullPath = path.join(API_ROOT, relativePath);
  
  if (!fs.existsSync(fullPath)) {
    result.errors.push(`File not found: ${fullPath}`);
    return result;
  }

  let content = fs.readFileSync(fullPath, 'utf-8');
  const originalContent = content;

  // Add import for checkPermission if not present
  if (!content.includes('checkPermission')) {
    if (content.includes("import { checkAdmin }")) {
      content = content.replace(
        "import { checkAdmin } from '@/lib/auth';",
        "import { checkAdmin, checkPermission } from '@/lib/auth';"
      );
      result.changes.push('Added checkPermission import');
    } else if (content.includes("from '@/lib/auth'")) {
      // Handle case where there might be other imports
      content = content.replace(
        /from '@\/lib\/auth';/,
        "from '@/lib/auth';\nimport { checkPermission } from '@/lib/auth';"
      );
      result.changes.push('Added checkPermission import');
    }
  }

  // Replace checkAdmin() with checkPermission() for each HTTP method
  Object.entries(permissions).forEach(([method, permission]) => {
    // Pattern 1: const user = await checkAdmin();
    const pattern1 = new RegExp(
      `(export\\s+async\\s+function\\s+${method}[^{]*{[^]*?)const\\s+user\\s+=\\s+await\\s+checkAdmin\\(\\);`,
      'g'
    );
    
    if (pattern1.test(content)) {
      content = content.replace(
        pattern1,
        `$1const user = await checkPermission('${permission}');`
      );
      result.changes.push(`${method}: Replaced checkAdmin() with checkPermission('${permission}')`);
    }

    // Pattern 2: const user = await checkPermission(...) - update permission string
    const pattern2 = new RegExp(
      `(export\\s+async\\s+function\\s+${method}[^{]*{[^]*?)const\\s+user\\s+=\\s+await\\s+checkPermission\\(['"]([^'"]+)['"]\\);`,
      'g'
    );
    
    if (pattern2.test(content) && !content.includes(`checkPermission('${permission}')`)) {
      content = content.replace(
        pattern2,
        `$1const user = await checkPermission('${permission}');`
      );
      result.changes.push(`${method}: Updated permission to '${permission}'`);
    }
  });

  // Write back if changed
  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf-8');
    result.success = true;
  } else {
    result.errors.push('No changes made - patterns not matched');
  }

  return result;
}

// Process all files
console.log('🔄 Batch Updating Admin API Routes with RBAC Permissions\n');
console.log('=' .repeat(70));

Object.entries(PERMISSION_MAP).forEach(([file, permissions]) => {
  console.log(`\n📁 Processing: ${file}`);
  const result = updateFile(file, permissions);
  results.push(result);

  if (result.success) {
    console.log('   ✅ Success!');
    result.changes.forEach(change => {
      console.log(`      ${change}`);
    });
  } else {
    console.log('   ❌ Failed');
    result.errors.forEach(error => {
      console.log(`      ${error}`);
    });
  }
});

// Summary
console.log('\n' + '=' .repeat(70));
console.log('\n📊 SUMMARY:\n');
const successful = results.filter(r => r.success).length;
const failed = results.filter(r => !r.success).length;

console.log(`Total Files: ${results.length}`);
console.log(`✅ Successfully Updated: ${successful}`);
console.log(`❌ Failed: ${failed}`);

if (failed > 0) {
  console.log('\n⚠️  Failed Files:');
  results.filter(r => !r.success).forEach(r => {
    console.log(`   - ${r.file}`);
    r.errors.forEach(err => console.log(`     ${err}`));
  });
}

console.log('\n' + '=' .repeat(70));
console.log('\n💡 Next Steps:');
console.log('1. Review the changes in each file');
console.log('2. Test each API endpoint with proper permissions');
console.log('3. Update UI components to check permissions');
console.log('4. Run: npx tsx scripts/test-rbac-system.ts\n');

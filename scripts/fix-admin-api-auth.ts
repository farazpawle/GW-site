// Fix all admin API routes to use checkAdmin() instead of requireAdmin()
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const files = [
  'src/app/api/admin/users/[userId]/route.ts',
  'src/app/api/admin/users/[userId]/role/route.ts',
  'src/app/api/admin/users/route.ts',
  'src/app/api/admin/users/bulk-role/route.ts',
  'src/app/api/admin/parts/[id]/oem-numbers/[oemId]/route.ts',
  'src/app/api/admin/parts/[id]/oem-numbers/route.ts',
  'src/app/api/admin/parts/[id]/cross-references/[refId]/route.ts',
  'src/app/api/admin/parts/[id]/cross-references/route.ts',
  'src/app/api/admin/parts/[id]/vehicle-compatibility/route.ts',
  'src/app/api/admin/parts/[id]/vehicle-compatibility/[compatId]/route.ts',
  'src/app/api/admin/parts/route.ts',
  'src/app/api/admin/parts/bulk/route.ts',
  'src/app/api/admin/upload/route.ts',
  'src/app/api/admin/products/top-viewed/route.ts',
  'src/app/api/admin/products/template/route.ts',
  'src/app/api/admin/products/needs-attention/route.ts',
  'src/app/api/admin/products/import/vehicle-compatibility/validate/route.ts',
  'src/app/api/admin/products/import/vehicle-compatibility/execute/route.ts',
  'src/app/api/admin/products/import/validate/route.ts',
  'src/app/api/admin/products/import/oem-numbers/validate/route.ts',
  'src/app/api/admin/products/import/oem-numbers/execute/route.ts',
  'src/app/api/admin/products/import/execute/route.ts',
  'src/app/api/admin/products/import/cross-reference/validate/route.ts',
  'src/app/api/admin/products/import/cross-reference/execute/route.ts',
  'src/app/api/admin/products/export/vehicle-compatibility/route.ts',
  'src/app/api/admin/products/export/route.ts',
  'src/app/api/admin/products/export/oem-numbers/route.ts',
  'src/app/api/admin/products/export/cross-reference/route.ts',
  'src/app/api/admin/messages/route.ts',
  'src/app/api/admin/messages/dashboard/route.ts',
  'src/app/api/admin/messages/[id]/route.ts',
  'src/app/api/admin/media/proxy/route.ts',
  'src/app/api/admin/media/buckets/route.ts',
  'src/app/api/admin/media/files/route.ts',
  'src/app/api/admin/media/files/[key]/route.ts',
  'src/app/api/admin/collections/preview/route.ts',
  'src/app/api/admin/collections/filter-options/route.ts',
  'src/app/api/admin/categories/[id]/route.ts',
  'src/app/api/admin/categories/route.ts',
];

let fixedCount = 0;
let errorCount = 0;

for (const file of files) {
  const fullPath = join(process.cwd(), file);
  
  if (!existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${file}`);
    continue;
  }
  
  try {
    let content = readFileSync(fullPath, 'utf8');
    
    // Check if file uses requireAdmin
    if (content.includes('requireAdmin')) {
      console.log(`📝 Fixing: ${file}`);
      
      // Replace import statement
      content = content.replace(
        /import \{ requireAdmin \} from '@\/lib\/auth';/g,
        "import { checkAdmin } from '@/lib/auth';"
      );
      
      // Replace await requireAdmin(); pattern
      content = content.replace(
        /await requireAdmin\(\);/g,
        `const user = await checkAdmin();\n    if (!user) {\n      return NextResponse.json(\n        { success: false, error: 'Unauthorized' },\n        { status: 401 }\n      );\n    }`
      );
      
      // Replace const currentUser = await requireAdmin(); pattern
      content = content.replace(
        /const currentUser = await requireAdmin\(\);/g,
        `const currentUser = await checkAdmin();\n    if (!currentUser) {\n      return NextResponse.json(\n        { success: false, error: 'Unauthorized' },\n        { status: 401 }\n      );\n    }`
      );
      
      // Save the file
      writeFileSync(fullPath, content, 'utf8');
      fixedCount++;
      console.log(`✅ Fixed: ${file}`);
    } else {
      console.log(`⏭️  Skipped (no requireAdmin): ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error fixing ${file}:`, error);
    errorCount++;
  }
}

console.log('\n📊 Summary:');
console.log(`  ✅ Fixed: ${fixedCount} files`);
console.log(`  ❌ Errors: ${errorCount} files`);
console.log('\n🎉 Done! Please restart your Next.js dev server.');

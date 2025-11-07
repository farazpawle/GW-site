/**
 * RBAC Audit Script
 * Scans all admin API routes to find missing permission checks
 * 
 * Usage: npx tsx scripts/audit-rbac.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface RouteAudit {
  file: string;
  hasCheckAdmin: boolean;
  hasCheckPermission: boolean;
  methods: string[];
  issues: string[];
}

async function auditRoute(filePath: string): Promise<RouteAudit> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const result: RouteAudit = {
    file: filePath.replace(/\\/g, '/'),
    hasCheckAdmin: false,
    hasCheckPermission: false,
    methods: [],
    issues: [],
  };

  // Check for exported HTTP methods
  const methodRegex = /export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\s*\(/g;
  let match;
  while ((match = methodRegex.exec(content)) !== null) {
    result.methods.push(match[1]);
  }

  // Check for permission checks
  result.hasCheckAdmin = content.includes('checkAdmin()') || content.includes('requireAdmin()');
  result.hasCheckPermission = content.includes('checkPermission(') || content.includes('requirePermission(');

  // Check for Clerk auth without our checks
  const hasClerkAuth = content.includes('await auth()');
  
  // Identify issues
  if (result.methods.length > 0) {
    if (!result.hasCheckAdmin && !result.hasCheckPermission && !hasClerkAuth) {
      result.issues.push('⚠️  NO AUTHENTICATION CHECK');
    } else if (result.hasCheckAdmin && !result.hasCheckPermission) {
      result.issues.push('⚠️  Uses checkAdmin() but NO specific permission check');
    }
  }

  return result;
}

async function main() {
  console.log('🔍 RBAC Audit: Scanning all admin API routes...\n');

  // Find all admin API route files
  const routes = await glob('src/app/api/admin/**/route.ts', {
    cwd: process.cwd(),
    absolute: true,
  });

  console.log(`📋 Found ${routes.length} admin API routes\n`);

  const audits: RouteAudit[] = [];
  
  for (const route of routes) {
    const audit = await auditRoute(route);
    audits.push(audit);
  }

  // Group by resource type
  const byResource: Record<string, RouteAudit[]> = {};
  
  for (const audit of audits) {
    const relativePath = audit.file.replace(/.*\/api\/admin\//, '');
    const resource = relativePath.split('/')[0];
    
    if (!byResource[resource]) {
      byResource[resource] = [];
    }
    byResource[resource].push(audit);
  }

  // Print results by resource
  console.log('📊 RBAC Audit Results by Resource:\n');

  const resourceOrder = [
    'products', 'parts', 'categories', 'collections',
    'pages', 'page-sections', 'menu-items',
    'media', 'upload',
    'users', 'current-user',
    'messages', 'analytics', 'settings'
  ];

  let totalIssues = 0;

  for (const resource of resourceOrder) {
    if (!byResource[resource]) continue;

    const resourceAudits = byResource[resource];
    const issues = resourceAudits.filter(a => a.issues.length > 0);
    
    console.log(`\n🗂️  ${resource.toUpperCase()} (${resourceAudits.length} routes, ${issues.length} issues)`);
    console.log('─'.repeat(60));

    for (const audit of resourceAudits) {
      const fileName = audit.file.split('/').slice(-2).join('/');
      const status = audit.issues.length > 0 ? '❌' : '✅';
      const authType = audit.hasCheckPermission 
        ? 'Permission' 
        : audit.hasCheckAdmin 
        ? 'Admin' 
        : 'None';

      console.log(`${status} ${fileName}`);
      console.log(`   Methods: ${audit.methods.join(', ') || 'None'}`);
      console.log(`   Auth: ${authType}`);
      
      if (audit.issues.length > 0) {
        audit.issues.forEach(issue => console.log(`   ${issue}`));
        totalIssues += audit.issues.length;
      }
    }
  }

  // Print summary
  console.log('\n' + '═'.repeat(60));
  console.log('📈 Summary:');
  console.log(`   Total Routes: ${audits.length}`);
  console.log(`   With Permission Checks: ${audits.filter(a => a.hasCheckPermission).length}`);
  console.log(`   With Admin-only Checks: ${audits.filter(a => a.hasCheckAdmin && !a.hasCheckPermission).length}`);
  console.log(`   Total Issues: ${totalIssues}`);
  console.log('═'.repeat(60));

  if (totalIssues > 0) {
    console.log('\n💡 Recommendation:');
    console.log('   Replace checkAdmin() with checkPermission(\'resource.action\')');
    console.log('   Example: checkPermission(\'products.edit\') for editing products');
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  });

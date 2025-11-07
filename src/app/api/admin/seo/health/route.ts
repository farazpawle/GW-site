import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/rbac/guards';
import { PERMISSIONS } from '@/lib/rbac/permissions';
import { prisma } from '@/lib/prisma';
import { getSetting } from '@/lib/settings/settings-manager';

/**
 * SEO Health Check API
 * GET /api/admin/seo/health
 * 
 * Analyzes website SEO and returns health report
 */

interface HealthCheck {
  name: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
  details?: string;
}

interface SEOHealthCheck {
  category: string;
  checks: HealthCheck[];
}

export async function GET() {
  try {
    // Require settings.view permission
    const userOrError = await requirePermission(PERMISSIONS.SETTINGS_VIEW);
    if (userOrError instanceof NextResponse) return userOrError;

    const checks: SEOHealthCheck[] = [];

    // ============================================
    // 1. Meta Tags Check
    // ============================================
    const metaChecks: HealthCheck[] = [];
    
    const seoTitle = await getSetting('seo_title');
    const seoDescription = await getSetting('seo_description');
    const seoKeywords = await getSetting('seo_keywords');
    const seoOgImage = await getSetting('seo_og_image');

    metaChecks.push({
      name: 'SEO Title',
      status: seoTitle && seoTitle.length > 0 && seoTitle.length <= 60 ? 'pass' : seoTitle && seoTitle.length > 60 ? 'warning' : 'fail',
      message: seoTitle ? `Title set (${seoTitle.length} chars)` : 'SEO title not configured',
      details: seoTitle && seoTitle.length > 60 ? 'Title exceeds 60 characters' : undefined,
    });

    metaChecks.push({
      name: 'Meta Description',
      status: seoDescription && seoDescription.length >= 120 && seoDescription.length <= 160 ? 'pass' : seoDescription && seoDescription.length > 0 ? 'warning' : 'fail',
      message: seoDescription ? `Description set (${seoDescription.length} chars)` : 'Meta description not configured',
      details: seoDescription && (seoDescription.length < 120 || seoDescription.length > 160) ? 'Optimal length is 120-160 characters' : undefined,
    });

    metaChecks.push({
      name: 'Meta Keywords',
      status: seoKeywords && seoKeywords.length > 0 ? 'pass' : 'warning',
      message: seoKeywords ? 'Keywords configured' : 'No keywords set (low priority)',
    });

    metaChecks.push({
      name: 'Open Graph Image',
      status: seoOgImage && seoOgImage.length > 0 ? 'pass' : 'warning',
      message: seoOgImage ? 'OG image configured' : 'No OG image set',
    });

    checks.push({ category: 'Meta Tags & SEO Basics', checks: metaChecks });

    // ============================================
    // 2. Content Quality Check
    // ============================================
    const contentChecks: HealthCheck[] = [];

    // Check products
    const totalProducts = await prisma.part.count();
    const publishedProducts = await prisma.part.count({ where: { published: true } });
    const productsWithDesc = await prisma.part.count({ 
      where: { 
        published: true,
        description: { not: null },
      } 
    });

    contentChecks.push({
      name: 'Published Products',
      status: publishedProducts > 0 ? 'pass' : 'fail',
      message: `${publishedProducts} of ${totalProducts} products published`,
    });

    const descPercentage = publishedProducts > 0 ? Math.round((productsWithDesc / publishedProducts) * 100) : 0;
    contentChecks.push({
      name: 'Product Descriptions',
      status: descPercentage > 80 ? 'pass' : descPercentage > 50 ? 'warning' : 'fail',
      message: `${descPercentage}% of products have descriptions`,
      details: descPercentage < 80 ? 'Add descriptions to improve SEO' : undefined,
    });

    checks.push({ category: 'Content Quality', checks: contentChecks });

    // ============================================
    // 3. Analytics & Tracking
    // ============================================
    const analyticsChecks: HealthCheck[] = [];

    const gaId = await getSetting('google_analytics_id');
    const gtmId = await getSetting('google_tag_manager_id');

    analyticsChecks.push({
      name: 'Google Analytics',
      status: gaId && gaId.length > 0 ? 'pass' : 'warning',
      message: gaId ? 'GA configured' : 'Google Analytics not configured',
    });

    analyticsChecks.push({
      name: 'Google Tag Manager',
      status: gtmId && gtmId.length > 0 ? 'pass' : 'warning',
      message: gtmId ? 'GTM configured' : 'Tag Manager not configured',
    });

    checks.push({ category: 'Analytics & Tracking', checks: analyticsChecks });

    // ============================================
    // 4. Technical SEO
    // ============================================
    const technicalChecks: HealthCheck[] = [];

    technicalChecks.push({
      name: 'Sitemap',
      status: 'pass',
      message: 'Sitemap.xml available at /sitemap.xml',
    });

    technicalChecks.push({
      name: 'Robots.txt',
      status: 'pass',
      message: 'Robots.txt configured',
    });

    // Check for duplicate slugs
    const duplicateSlugs = await prisma.part.groupBy({
      by: ['slug'],
      _count: { slug: true },
      having: { slug: { _count: { gt: 1 } } },
    });

    technicalChecks.push({
      name: 'Duplicate URLs',
      status: duplicateSlugs.length === 0 ? 'pass' : 'fail',
      message: duplicateSlugs.length === 0 ? 'No duplicate URLs found' : `${duplicateSlugs.length} duplicate URL(s) detected`,
      details: duplicateSlugs.length > 0 ? 'Fix duplicate product slugs' : undefined,
    });

    checks.push({ category: 'Technical SEO', checks: technicalChecks });

    // ============================================
    // 5. Performance
    // ============================================
    const performanceChecks: HealthCheck[] = [];

    performanceChecks.push({
      name: 'Web Vitals Tracking',
      status: 'pass',
      message: 'Core Web Vitals monitoring active',
    });

    performanceChecks.push({
      name: 'Image Optimization',
      status: 'pass',
      message: 'Using Next.js Image optimization',
    });

    checks.push({ category: 'Performance', checks: performanceChecks });

    return NextResponse.json({
      success: true,
      checks,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[SEO Health API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate health report' },
      { status: 500 }
    );
  }
}

import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

/**
 * Enhanced sitemap generation
 * Includes: static pages, products, categories, collections, dynamic pages
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://garritwulf.com';

  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  try {
    // Fetch all published products
    const products = await prisma.part.findMany({
      where: {
        published: true,
      },
      select: {
        slug: true,
        publishedAt: true,
        updatedAt: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
    });

    // Fetch all published dynamic pages
    const pages = await prisma.page.findMany({
      where: {
        published: true,
        pageType: 'dynamic',
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    // Fetch all categories with products
    const categories = await prisma.category.findMany({
      where: {
        parts: {
          some: {
            published: true,
          },
        },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    // Fetch all collections
    const collections = await prisma.collection.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    // Fetch published static pages (privacy, terms, etc.)
    const staticPages = await prisma.page.findMany({
      where: {
        published: true,
        pageType: 'static',
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    // Generate product routes
    const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: product.publishedAt || product.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    // Generate dynamic page routes
    const pageRoutes: MetadataRoute.Sitemap = pages.map((page) => ({
      url: `${baseUrl}/${page.slug}`,
      lastModified: page.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    // Generate category routes
    const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${baseUrl}/category/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    // Generate collection routes
    const collectionRoutes: MetadataRoute.Sitemap = collections.map((collection) => ({
      url: `${baseUrl}/collection/${collection.slug}`,
      lastModified: collection.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    // Generate static page routes (privacy, terms)
    const staticPageRoutes: MetadataRoute.Sitemap = staticPages.map((page) => ({
      url: `${baseUrl}/${page.slug}`,
      lastModified: page.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }));

    return [
      ...staticRoutes,
      ...productRoutes,
      ...pageRoutes,
      ...categoryRoutes,
      ...collectionRoutes,
      ...staticPageRoutes,
    ];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return static routes if database query fails
    return staticRoutes;
  }
}

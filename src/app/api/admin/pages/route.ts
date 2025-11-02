import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { pageSchema } from '@/lib/validations/page';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

/**
 * GET /api/admin/pages
 * List all pages with pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate admin user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const published = searchParams.get('published');

    // Build where clause with proper typing
    const where: Prisma.PageWhereInput = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (published !== null && published !== undefined) {
      where.published = published === 'true';
    }

    // Get pages with pagination
    const [pages, total] = await Promise.all([
      prisma.page.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: { menuItems: true }
          }
        }
      }),
      prisma.page.count({ where })
    ]);

    return NextResponse.json({
      pages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/pages
 * Create a new page
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate admin user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = pageSchema.parse(body);

    // Check for duplicate slug
    const existingPage = await prisma.page.findUnique({
      where: { slug: validatedData.slug }
    });

    if (existingPage) {
      return NextResponse.json(
        { error: 'A page with this slug already exists' },
        { status: 409 }
      );
    }

    // Create page (handle both static and dynamic types)
    let page;
    if (validatedData.pageType === 'static') {
      page = await prisma.page.create({
        data: {
          title: validatedData.title,
          slug: validatedData.slug,
          description: validatedData.description,
          content: validatedData.content,
          metaTitle: validatedData.metaTitle,
          metaDesc: validatedData.metaDesc,
          published: validatedData.published,
          publishedAt: validatedData.published ? new Date() : undefined,
        }
      });
    } else {
      page = await prisma.page.create({
        data: {
          title: validatedData.title,
          slug: validatedData.slug,
          description: validatedData.description,
          groupType: validatedData.groupType,
          groupValues: validatedData.groupValues,
          layout: validatedData.layout,
          sortBy: validatedData.sortBy,
          itemsPerPage: validatedData.itemsPerPage,
          metaTitle: validatedData.metaTitle,
          metaDesc: validatedData.metaDesc,
          published: validatedData.published,
          publishedAt: validatedData.published ? new Date() : undefined,
        }
      });
    }

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating page:', error);
    return NextResponse.json(
      { error: 'Failed to create page' },
      { status: 500 }
    );
  }
}

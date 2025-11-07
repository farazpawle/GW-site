/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  createPageSectionSchema, 
  validateSectionConfig
} from '@/types/page-section';
import { ZodError } from 'zod';
import { checkPermission } from '@/lib/auth';

/**
 * GET /api/admin/page-sections?pageId={pageId}
 * Fetch all sections for a specific page
 * Requires: homepage.view permission
 */
export async function GET(request: NextRequest) {
  try {
    // Check permission for homepage viewing
    const user = await checkPermission('homepage.view');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You do not have permission to view homepage sections' },
        { status: 403 }
      );
    }

    // Get pageId from query parameters
    const searchParams = request.nextUrl.searchParams;
    const pageId = searchParams.get('pageId');

    if (!pageId) {
      return NextResponse.json(
        { success: false, error: 'pageId query parameter is required' },
        { status: 400 }
      );
    }

    // Verify page exists
    const page = await prisma.page.findUnique({
      where: { id: pageId }
    });

    if (!page) {
      return NextResponse.json(
        { success: false, error: 'Page not found' },
        { status: 404 }
      );
    }

    // Fetch sections ordered by position
    const sections = await prisma.pageSection.findMany({
      where: { pageId },
      orderBy: { position: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: sections
    });
  } catch (error) {
    console.error('Error fetching page sections:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch page sections' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/page-sections
 * Create a new page section
 * Requires: homepage.edit permission
 */
export async function POST(request: NextRequest) {
  try {
    // Check permission for homepage editing
    const user = await checkPermission('homepage.edit');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You do not have permission to create homepage sections' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createPageSectionSchema.parse(body);

    // Validate section-specific config
    try {
      validateSectionConfig(validatedData.sectionType, validatedData.config);
    } catch (configError) {
      if (configError instanceof ZodError) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid section configuration',
            details: configError.issues 
          },
          { status: 400 }
        );
      }
      throw configError;
    }

    // Verify page exists
    const page = await prisma.page.findUnique({
      where: { id: validatedData.pageId }
    });

    if (!page) {
      return NextResponse.json(
        { success: false, error: 'Page not found' },
        { status: 404 }
      );
    }

    // Check if position is already taken
    const existingSection = await prisma.pageSection.findFirst({
      where: {
        pageId: validatedData.pageId,
        position: validatedData.position
      }
    });

    if (existingSection) {
      // Shift positions of sections at or after the new position
      await prisma.pageSection.updateMany({
        where: {
          pageId: validatedData.pageId,
          position: { gte: validatedData.position }
        },
        data: {
          position: { increment: 1 }
        }
      });
    }

    // Create the section
    const newSection = await prisma.pageSection.create({
      data: {
        pageId: validatedData.pageId,
        sectionType: validatedData.sectionType,
        position: validatedData.position,
        visible: validatedData.visible,
        config: validatedData.config as any // Prisma Json type
      }
    });

    return NextResponse.json({
      success: true,
      data: newSection
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating page section:', error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: error.issues 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create page section' },
      { status: 500 }
    );
  }
}

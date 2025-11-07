import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { reorderSectionsSchema } from '@/types/page-section';
import { ZodError } from 'zod';
import { checkPermission } from '@/lib/auth';

/**
 * PATCH /api/admin/page-sections/reorder
 * Reorder multiple page sections in a single transaction
 * Requires: homepage.edit permission
 */
export async function PATCH(request: NextRequest) {
  try {
    // Check permission for homepage editing
    const user = await checkPermission('homepage.edit');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You do not have permission to reorder homepage sections' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = reorderSectionsSchema.parse(body);

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

    // Verify all sections exist and belong to the page
    const sectionIds = validatedData.sections.map(s => s.id);
    const existingSections = await prisma.pageSection.findMany({
      where: {
        id: { in: sectionIds },
        pageId: validatedData.pageId
      }
    });

    if (existingSections.length !== sectionIds.length) {
      return NextResponse.json(
        { success: false, error: 'One or more sections not found or do not belong to this page' },
        { status: 404 }
      );
    }

    // Perform updates in a transaction
    await prisma.$transaction(
      validatedData.sections.map(section =>
        prisma.pageSection.update({
          where: { id: section.id },
          data: { position: section.position }
        })
      )
    );

    // Fetch updated sections
    const updatedSections = await prisma.pageSection.findMany({
      where: { pageId: validatedData.pageId },
      orderBy: { position: 'asc' }
    });

    return NextResponse.json({
      success: true,
      message: 'Sections reordered successfully',
      data: updatedSections
    });

  } catch (error) {
    console.error('Error reordering page sections:', error);

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
      { success: false, error: 'Failed to reorder page sections' },
      { status: 500 }
    );
  }
}

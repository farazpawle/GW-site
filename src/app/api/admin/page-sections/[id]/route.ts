import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  updatePageSectionSchema,
  validateSectionConfig
} from '@/types/page-section';
import { ZodError } from 'zod';
import { checkPermission } from '@/lib/auth';

/**
 * PUT /api/admin/page-sections/[id]
 * Update an existing page section
 * Requires: homepage.edit permission
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let resolvedParams: { id: string } | null = null;
  let requestBody: unknown;
  let validatedData: ReturnType<typeof updatePageSectionSchema.parse> | null = null;

  try {
    // Check permission for homepage editing
    const user = await checkPermission('homepage.edit');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You do not have permission to edit homepage sections' },
        { status: 403 }
      );
    }

    resolvedParams = await params;
    const { id } = resolvedParams;

    console.log('[PageSection PUT] Incoming request', {
      sectionId: id,
      userId: user.id
    });

    // Check if section exists
    const existingSection = await prisma.pageSection.findUnique({
      where: { id }
    });

    if (!existingSection) {
      return NextResponse.json(
        { success: false, error: 'Section not found' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    requestBody = await request.json();
    console.log('[PageSection PUT] Raw payload received', {
      sectionId: id,
      keys: requestBody && typeof requestBody === 'object' ? Object.keys(requestBody as Record<string, unknown>) : null
    });

    validatedData = updatePageSectionSchema.parse(requestBody);

    console.log('[PageSection PUT] Payload validated', {
      sectionId: id,
      hasConfig: Boolean(validatedData.config),
      sectionType: validatedData.sectionType || existingSection.sectionType
    });

    // If config is being updated, validate it
    if (validatedData.config) {
      const sectionType = validatedData.sectionType || existingSection.sectionType;
      try {
        validateSectionConfig(sectionType as any, validatedData.config);
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
    }

    // If position is being updated, handle reordering
    if (validatedData.position !== undefined && validatedData.position !== existingSection.position) {
      const oldPosition = existingSection.position;
      const newPosition = validatedData.position;

      if (newPosition > oldPosition) {
        // Moving down: shift sections between old and new position up
        await prisma.pageSection.updateMany({
          where: {
            pageId: existingSection.pageId,
            position: {
              gt: oldPosition,
              lte: newPosition
            }
          },
          data: {
            position: { decrement: 1 }
          }
        });
      } else if (newPosition < oldPosition) {
        // Moving up: shift sections between new and old position down
        await prisma.pageSection.updateMany({
          where: {
            pageId: existingSection.pageId,
            position: {
              gte: newPosition,
              lt: oldPosition
            }
          },
          data: {
            position: { increment: 1 }
          }
        });
      }
    }

    // Update the section
    const updatedSection = await prisma.pageSection.update({
      where: { id },
      data: {
        ...(validatedData.sectionType && { sectionType: validatedData.sectionType }),
        ...(validatedData.name !== undefined && { name: validatedData.name }),
        ...(validatedData.position !== undefined && { position: validatedData.position }),
        ...(validatedData.visible !== undefined && { visible: validatedData.visible }),
        ...(validatedData.config && { config: validatedData.config as any })
      }
    });

    console.log('[PageSection PUT] Update succeeded', {
      sectionId: id
    });

    return NextResponse.json({
      success: true,
      data: updatedSection
    });

  } catch (error) {
    const sectionId = resolvedParams?.id;
    console.error('[PageSection PUT] Error updating page section', {
      sectionId,
      payloadSummary:
        requestBody && typeof requestBody === 'object'
          ? Object.keys(requestBody as Record<string, unknown>)
          : requestBody === undefined
            ? 'unreadable'
            : null,
      validationApplied: Boolean(validatedData),
      error
    });

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

    if (
      error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Prisma.PrismaClientValidationError
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update page section',
          details: error.message
        },
        { status: 500 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update page section',
          details: error.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update page section' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/page-sections/[id]
 * Delete a page section
 * Requires: homepage.edit permission
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check permission for homepage editing
    const user = await checkPermission('homepage.edit');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You do not have permission to delete homepage sections' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if section exists
    const existingSection = await prisma.pageSection.findUnique({
      where: { id }
    });

    if (!existingSection) {
      return NextResponse.json(
        { success: false, error: 'Section not found' },
        { status: 404 }
      );
    }

    // Delete the section
    await prisma.pageSection.delete({
      where: { id }
    });

    // Reorder remaining sections to fill the gap
    await prisma.pageSection.updateMany({
      where: {
        pageId: existingSection.pageId,
        position: { gt: existingSection.position }
      },
      data: {
        position: { decrement: 1 }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Section deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting page section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete page section' },
      { status: 500 }
    );
  }
}

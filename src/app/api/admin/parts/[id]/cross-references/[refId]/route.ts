import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { crossReferenceSchema } from '@/lib/validations/cross-reference';
import { ZodError } from 'zod';

/**
 * PUT /api/admin/parts/[id]/cross-references/[refId]
 * Update a cross-reference
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; refId: string }> }
) {
  try {
    const user = await checkAdmin();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: partId, refId } = await params;
    const body = await request.json();

    // Validate request body
    const validatedData = crossReferenceSchema.parse(body);

    // Check if cross-reference exists
    const existingRef = await prisma.partCrossReference.findUnique({
      where: { id: refId },
    });

    if (!existingRef) {
      return NextResponse.json(
        { success: false, error: 'Cross-reference not found' },
        { status: 404 }
      );
    }

    // Verify it belongs to the specified part
    if (existingRef.partId !== partId) {
      return NextResponse.json(
        { success: false, error: 'Cross-reference does not belong to this part' },
        { status: 400 }
      );
    }

    // If referencedPartId is provided, check if it exists
    if (validatedData.referencedPartId) {
      const referencedPart = await prisma.part.findUnique({
        where: { id: validatedData.referencedPartId },
      });

      if (!referencedPart) {
        return NextResponse.json(
          { success: false, error: 'Referenced part not found' },
          { status: 400 }
        );
      }
    }

    // Update cross-reference
    const updatedRef = await prisma.partCrossReference.update({
      where: { id: refId },
      data: validatedData,
      include: {
        referencedPart: {
          select: {
            id: true,
            name: true,
            slug: true,
            partNumber: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedRef,
    });

  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating cross-reference:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update cross-reference' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/parts/[id]/cross-references/[refId]
 * Delete a cross-reference
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; refId: string }> }
) {
  try {
    const user = await checkAdmin();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: partId, refId } = await params;

    // Check if cross-reference exists
    const existingRef = await prisma.partCrossReference.findUnique({
      where: { id: refId },
    });

    if (!existingRef) {
      return NextResponse.json(
        { success: false, error: 'Cross-reference not found' },
        { status: 404 }
      );
    }

    // Verify it belongs to the specified part
    if (existingRef.partId !== partId) {
      return NextResponse.json(
        { success: false, error: 'Cross-reference does not belong to this part' },
        { status: 400 }
      );
    }

    // Delete cross-reference
    await prisma.partCrossReference.delete({
      where: { id: refId },
    });

    return NextResponse.json({
      success: true,
      message: 'Cross-reference deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting cross-reference:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete cross-reference' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { oemPartNumberSchema } from '@/lib/validations/cross-reference';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

/**
 * PUT /api/admin/parts/[id]/oem-numbers/[oemId]
 * Update an existing OEM part number
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; oemId: string }> }
) {
  try {
    await requireAdmin();

    const { id: partId, oemId } = await params;
    const body = await request.json();

    // Validate request body
    const validatedData = oemPartNumberSchema.parse(body);

    // Check if OEM part number exists
    const existingOEM = await prisma.oEMPartNumber.findUnique({
      where: { id: oemId },
    });

    if (!existingOEM) {
      return NextResponse.json(
        { success: false, error: 'OEM part number not found' },
        { status: 404 }
      );
    }

    // Verify ownership - ensure the OEM number belongs to this part
    if (existingOEM.partId !== partId) {
      return NextResponse.json(
        { success: false, error: 'OEM part number does not belong to this part' },
        { status: 403 }
      );
    }

    // Update OEM part number
    const updatedOEM = await prisma.oEMPartNumber.update({
      where: { id: oemId },
      data: validatedData,
    });

    return NextResponse.json({
      success: true,
      data: updatedOEM,
    });

  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    // Handle unique constraint violation
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { success: false, error: 'This OEM part number already exists for this part' },
          { status: 400 }
        );
      }
    }

    console.error('Error updating OEM part number:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update OEM part number' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/parts/[id]/oem-numbers/[oemId]
 * Delete an OEM part number
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; oemId: string }> }
) {
  try {
    await requireAdmin();

    const { id: partId, oemId } = await params;

    // Check if OEM part number exists
    const existingOEM = await prisma.oEMPartNumber.findUnique({
      where: { id: oemId },
    });

    if (!existingOEM) {
      return NextResponse.json(
        { success: false, error: 'OEM part number not found' },
        { status: 404 }
      );
    }

    // Verify ownership - ensure the OEM number belongs to this part
    if (existingOEM.partId !== partId) {
      return NextResponse.json(
        { success: false, error: 'OEM part number does not belong to this part' },
        { status: 403 }
      );
    }

    // Delete OEM part number
    await prisma.oEMPartNumber.delete({
      where: { id: oemId },
    });

    return NextResponse.json({
      success: true,
      message: 'OEM part number deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting OEM part number:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete OEM part number' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { vehicleCompatibilitySchema } from '@/lib/validations/cross-reference';
import { ZodError } from 'zod';

/**
 * PUT /api/admin/parts/[id]/vehicle-compatibility/[compatId]
 * Update an existing vehicle compatibility record
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; compatId: string }> }
) {
  try {
    await requireAdmin();

    const { id: partId, compatId } = await params;
    const body = await request.json();

    // Validate request body (includes year range validation)
    const validatedData = vehicleCompatibilitySchema.parse(body);

    // Check if vehicle compatibility record exists
    const existingCompat = await prisma.vehicleCompatibility.findUnique({
      where: { id: compatId },
    });

    if (!existingCompat) {
      return NextResponse.json(
        { success: false, error: 'Vehicle compatibility record not found' },
        { status: 404 }
      );
    }

    // Verify ownership - ensure the compatibility record belongs to this part
    if (existingCompat.partId !== partId) {
      return NextResponse.json(
        { success: false, error: 'Vehicle compatibility record does not belong to this part' },
        { status: 403 }
      );
    }

    // Update vehicle compatibility record
    const updatedCompat = await prisma.vehicleCompatibility.update({
      where: { id: compatId },
      data: validatedData,
    });

    return NextResponse.json({
      success: true,
      data: updatedCompat,
    });

  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating vehicle compatibility:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update vehicle compatibility' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/parts/[id]/vehicle-compatibility/[compatId]
 * Delete a vehicle compatibility record
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; compatId: string }> }
) {
  try {
    await requireAdmin();

    const { id: partId, compatId } = await params;

    // Check if vehicle compatibility record exists
    const existingCompat = await prisma.vehicleCompatibility.findUnique({
      where: { id: compatId },
    });

    if (!existingCompat) {
      return NextResponse.json(
        { success: false, error: 'Vehicle compatibility record not found' },
        { status: 404 }
      );
    }

    // Verify ownership - ensure the compatibility record belongs to this part
    if (existingCompat.partId !== partId) {
      return NextResponse.json(
        { success: false, error: 'Vehicle compatibility record does not belong to this part' },
        { status: 403 }
      );
    }

    // Delete vehicle compatibility record
    await prisma.vehicleCompatibility.delete({
      where: { id: compatId },
    });

    return NextResponse.json({
      success: true,
      message: 'Vehicle compatibility record deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting vehicle compatibility:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete vehicle compatibility' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { vehicleCompatibilitySchema } from '@/lib/validations/cross-reference';
import { ZodError } from 'zod';

/**
 * POST /api/admin/parts/[id]/vehicle-compatibility
 * Create a new vehicle compatibility record for a part
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id: partId } = await params;
    const body = await request.json();

    // Validate request body (includes year range validation)
    const validatedData = vehicleCompatibilitySchema.parse(body);

    // Check if part exists
    const part = await prisma.part.findUnique({
      where: { id: partId },
    });

    if (!part) {
      return NextResponse.json(
        { success: false, error: 'Part not found' },
        { status: 404 }
      );
    }

    // Create vehicle compatibility record
    const compatibility = await prisma.vehicleCompatibility.create({
      data: {
        partId,
        ...validatedData,
      },
    });

    return NextResponse.json({
      success: true,
      data: compatibility,
    });

  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating vehicle compatibility:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create vehicle compatibility' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/parts/[id]/vehicle-compatibility
 * Get all vehicle compatibility records for a part
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id: partId } = await params;

    // Check if part exists
    const part = await prisma.part.findUnique({
      where: { id: partId },
    });

    if (!part) {
      return NextResponse.json(
        { success: false, error: 'Part not found' },
        { status: 404 }
      );
    }

    // Get all vehicle compatibility records for this part
    const compatibilities = await prisma.vehicleCompatibility.findMany({
      where: { partId },
      orderBy: [
        { make: 'asc' },
        { model: 'asc' },
        { yearStart: 'desc' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: compatibilities,
    });

  } catch (error) {
    console.error('Error fetching vehicle compatibility:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vehicle compatibility' },
      { status: 500 }
    );
  }
}

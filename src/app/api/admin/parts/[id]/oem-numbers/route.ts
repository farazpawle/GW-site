import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { oemPartNumberSchema } from '@/lib/validations/cross-reference';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

/**
 * POST /api/admin/parts/[id]/oem-numbers
 * Create a new OEM part number for a part
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await checkAdmin();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: partId } = await params;
    const body = await request.json();

    // Validate request body
    const validatedData = oemPartNumberSchema.parse(body);

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

    // Create OEM part number
    const oemNumber = await prisma.oEMPartNumber.create({
      data: {
        partId,
        ...validatedData,
      },
    });

    return NextResponse.json({
      success: true,
      data: oemNumber,
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

    console.error('Error creating OEM part number:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create OEM part number' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/parts/[id]/oem-numbers
 * Get all OEM part numbers for a part
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await checkAdmin();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

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

    // Get all OEM part numbers for this part
    const oemNumbers = await prisma.oEMPartNumber.findMany({
      where: { partId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: oemNumbers,
    });

  } catch (error) {
    console.error('Error fetching OEM part numbers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch OEM part numbers' },
      { status: 500 }
    );
  }
}

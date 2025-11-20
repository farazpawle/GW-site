import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { crossReferenceSchema } from '@/lib/validations/cross-reference';
import { ZodError } from 'zod';

/**
 * POST /api/admin/parts/[id]/cross-references
 * Create a new cross-reference for a part
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
    const validatedData = crossReferenceSchema.parse(body);

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

    // Create cross-reference
    const crossReference = await prisma.partCrossReference.create({
      data: {
        partId,
        ...validatedData,
      },
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
      data: crossReference,
    });

  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating cross-reference:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create cross-reference' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/parts/[id]/cross-references
 * Get all cross-references for a part
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

    // Get all cross-references for this part
    const crossReferences = await prisma.partCrossReference.findMany({
      where: { partId },
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
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: crossReferences,
    });

  } catch (error) {
    console.error('Error fetching cross-references:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cross-references' },
      { status: 500 }
    );
  }
}

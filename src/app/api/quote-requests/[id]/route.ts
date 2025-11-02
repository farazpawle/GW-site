import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { quoteRequestUpdateSchema } from '@/lib/validation';
import { handleApiError, successResponse } from '@/lib/error-handler';
import { NotFoundError } from '@/lib/errors';

// ============================================================
// GET - Get Single Quote Request
// ============================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quoteRequest = await prisma.quoteRequest.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!quoteRequest) {
      throw new NotFoundError('Quote request not found', 'QUOTE_REQUEST_NOT_FOUND');
    }

    return successResponse(quoteRequest);
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================================
// PATCH - Update Quote Request (Admin only)
// ============================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = quoteRequestUpdateSchema.parse(body);

    // Update respondedAt when status changes to RESPONDED
    const updateData: Prisma.QuoteRequestUpdateInput = {
      ...validatedData,
    };

    if (validatedData.status === 'RESPONDED' && validatedData.respondedBy) {
      updateData.respondedAt = new Date();
    }

    const quoteRequest = await prisma.quoteRequest.update({
      where: {
        id: params.id,
      },
      data: updateData,
    });

    return successResponse(quoteRequest, 'Quote request updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================================
// DELETE - Delete Quote Request (Admin only)
// ============================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.quoteRequest.delete({
      where: {
        id: params.id,
      },
    });

    return successResponse(null, 'Quote request deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

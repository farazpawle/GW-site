import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { quoteRequestCreateSchema } from '@/lib/validation';
import { handleApiError, successResponse } from '@/lib/error-handler';

// ============================================================
// POST - Create Quote Request
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body using centralized schema
    const validatedData = quoteRequestCreateSchema.parse(body);

    // Create quote request in database
    const quoteRequest = await prisma.quoteRequest.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || null,
        company: validatedData.company || null,
        message: validatedData.message,
        products: validatedData.products || Prisma.JsonNull,
        status: 'PENDING',
      },
    });

    // TODO: Send email notification to admin
    // TODO: Send confirmation email to customer

    return successResponse(
      {
        id: quoteRequest.id,
        status: quoteRequest.status,
        createdAt: quoteRequest.createdAt,
      },
      'Quote request submitted successfully',
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================================
// GET - List Quote Requests (Admin only)
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'PENDING' | 'REVIEWED' | 'RESPONDED' | 'CLOSED' | null;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    // Build query filters
    const where: Prisma.QuoteRequestWhereInput = {};
    if (status) {
      where.status = status;
    }

    // Get total count
    const total = await prisma.quoteRequest.count({ where });

    // Get paginated quote requests
    const quoteRequests = await prisma.quoteRequest.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    return successResponse({
      quoteRequests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

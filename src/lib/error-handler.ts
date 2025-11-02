import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError, ValidationError, ConflictError, isOperationalError } from './errors';

/**
 * Standard API error response format
 */
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Standard API success response format
 */
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Handle API errors consistently across all routes
 * 
 * Usage in API routes:
 * try {
 *   // ... your code
 * } catch (error) {
 *   return handleApiError(error);
 * }
 */
export function handleApiError(error: unknown): NextResponse<ErrorResponse> {
  // Log all errors for debugging (in production, use proper logging service)
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', error);
  }

  // Handle custom AppError instances
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.statusCode }
    );
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: error.issues.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
            code: err.code,
          })),
        },
      },
      { status: 400 }
    );
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error);
  }

  // Handle Prisma validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DATABASE_VALIDATION_ERROR',
          message: 'Invalid database operation',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
      },
      { status: 400 }
    );
  }

  // Handle generic JavaScript errors
  if (error instanceof Error) {
    // Don't expose internal error details in production
    const message = process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'An unexpected error occurred';

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message,
        },
      },
      { status: 500 }
    );
  }

  // Handle unknown error types
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
      },
    },
    { status: 500 }
  );
}

/**
 * Handle Prisma-specific errors with appropriate HTTP status codes
 */
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): NextResponse<ErrorResponse> {
  switch (error.code) {
    // Unique constraint violation
    case 'P2002': {
      const target = error.meta?.target as string[] | undefined;
      const field = target?.[0] || 'field';
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DUPLICATE_ENTRY',
            message: `A record with this ${field} already exists`,
            details: {
              field,
              constraint: error.meta?.target,
            },
          },
        },
        { status: 409 }
      );
    }

    // Record not found
    case 'P2025':
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Record not found',
          },
        },
        { status: 404 }
      );

    // Foreign key constraint violation
    case 'P2003':
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FOREIGN_KEY_VIOLATION',
            message: 'Invalid reference to related record',
            details: {
              field: error.meta?.field_name,
            },
          },
        },
        { status: 400 }
      );

    // Record required but not found
    case 'P2015':
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RELATED_RECORD_NOT_FOUND',
            message: 'Related record not found',
          },
        },
        { status: 404 }
      );

    // Default for other Prisma errors
    default:
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Database operation failed',
            details: process.env.NODE_ENV === 'development' 
              ? { code: error.code, meta: error.meta } 
              : undefined,
          },
        },
        { status: 500 }
      );
  }
}

/**
 * Create a success response with consistent format
 * 
 * Usage:
 * return successResponse({ user: userData }, 'User created successfully', 201);
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<SuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status }
  );
}

/**
 * Async error wrapper for API route handlers
 * Automatically catches errors and handles them
 * 
 * Usage:
 * export const GET = asyncHandler(async (request) => {
 *   const data = await fetchData();
 *   return successResponse(data);
 * });
 */
export function asyncHandler<T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse<R>>
) {
  return async (...args: T): Promise<NextResponse<R | ErrorResponse>> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

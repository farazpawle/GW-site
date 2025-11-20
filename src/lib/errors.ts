/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Custom error classes for consistent error handling across the application
 * 
 * Usage:
 * throw new NotFoundError('Product not found', 'PRODUCT_NOT_FOUND');
 * throw new ValidationError('Invalid input', { field: 'email', issue: 'invalid format' });
 */

/**
 * Base application error class
 * All custom errors extend this class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: any;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    details?: any,
    isOperational = true
  ) {
    super(message);
    
    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;
    
    // Ensure the prototype chain is correct (for instanceof checks)
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Validation Error (400 Bad Request)
 * Used when user input fails validation
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

/**
 * Unauthorized Error (401 Unauthorized)
 * Used when authentication is required but missing or invalid
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access', code: string = 'UNAUTHORIZED') {
    super(message, 401, code);
  }
}

/**
 * Forbidden Error (403 Forbidden)
 * Used when user is authenticated but lacks permissions
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden', code: string = 'FORBIDDEN') {
    super(message, 403, code);
  }
}

/**
 * Not Found Error (404 Not Found)
 * Used when requested resource doesn't exist
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', code: string = 'NOT_FOUND') {
    super(message, 404, code);
  }
}

/**
 * Conflict Error (409 Conflict)
 * Used when request conflicts with current state (e.g., duplicate key)
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict', code: string = 'CONFLICT', details?: any) {
    super(message, 409, code, details);
  }
}

/**
 * Internal Server Error (500 Internal Server Error)
 * Used for unexpected server errors
 */
export class InternalServerError extends AppError {
  constructor(
    message: string = 'Internal server error',
    code: string = 'INTERNAL_ERROR',
    isOperational = false
  ) {
    super(message, 500, code, undefined, isOperational);
  }
}

/**
 * Bad Request Error (400 Bad Request)
 * Used for general malformed requests
 */
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', code: string = 'BAD_REQUEST', details?: any) {
    super(message, 400, code, details);
  }
}

/**
 * Service Unavailable Error (503 Service Unavailable)
 * Used when external service is unavailable
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service temporarily unavailable', code: string = 'SERVICE_UNAVAILABLE') {
    super(message, 503, code);
  }
}

/**
 * Type guard to check if error is an operational error
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

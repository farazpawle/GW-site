/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Environment Variable Validation
 * 
 * Validates required environment variables at server startup
 * to prevent runtime errors due to missing configuration.
 * 
 * This file should be imported early in the application lifecycle
 * (e.g., in middleware or root layout server component).
 */

import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  
  // MinIO (Object Storage)
  MINIO_ENDPOINT: z.string().min(1, 'MINIO_ENDPOINT is required'),
  MINIO_PORT: z.string().regex(/^\d+$/, 'MINIO_PORT must be a number'),
  MINIO_ACCESS_KEY: z.string().min(1, 'MINIO_ACCESS_KEY is required'),
  MINIO_SECRET_KEY: z.string().min(1, 'MINIO_SECRET_KEY is required'),
  MINIO_USE_SSL: z.string().regex(/^(true|false)$/, 'MINIO_USE_SSL must be "true" or "false"'),
  MINIO_BUCKET_NAME: z.string().min(1, 'MINIO_BUCKET_NAME is required'),
  
  // Clerk Authentication
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required'),
  CLERK_SECRET_KEY: z.string().min(1, 'CLERK_SECRET_KEY is required'),
  
  
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validates environment variables against the schema.
 * Throws an error with detailed messages if validation fails.
 * 
 * In CI environments, returns mock values to allow builds to complete.
 */
export function validateEnv(): Env {
  // Skip validation in CI environments (GitHub Actions, etc.)
  // CI builds don't need real database/storage credentials
  if (process.env.CI === 'true') {
    console.log('⚠️  CI environment detected - using mock environment variables for build');
    return {
      DATABASE_URL: 'postgresql://ci:ci@localhost:5432/ci',
      MINIO_ENDPOINT: 'localhost',
      MINIO_PORT: '9000',
      MINIO_ACCESS_KEY: 'ci-access-key',
      MINIO_SECRET_KEY: 'ci-secret-key',
      MINIO_USE_SSL: 'false',
      MINIO_BUCKET_NAME: 'ci-bucket',
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_ci-key',
      CLERK_SECRET_KEY: 'sk_test_ci-key',
      NODE_ENV: 'production',
    };
  }
  
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    const errors = result.error.format();
    
    console.error('❌ Environment variable validation failed:');
    console.error(JSON.stringify(errors, null, 2));
    
    // Create a user-friendly error message
    const missingVars = Object.keys(errors)
      .filter(key => key !== '_errors')
      .map(key => `  - ${key}: ${(errors as any)[key]._errors.join(', ')}`);
    
    throw new Error(
      `Missing or invalid environment variables:\n${missingVars.join('\n')}\n\n` +
      'Please check your .env.local file and ensure all required variables are set.\n' +
      'Refer to .env.example for the complete list of required variables.'
    );
  }
  
  console.log('✅ Environment variables validated successfully');
  return result.data;
}

/**
 * Validated environment variables.
 * Import this object instead of accessing process.env directly
 * to get type-safe environment variables.
 */
export const env = validateEnv();

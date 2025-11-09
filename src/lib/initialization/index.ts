/**
 * Application Initialization Orchestrator
 *
 * Coordinates all startup checks to ensure the application
 * has all required infrastructure and data.
 *
 * Runs automatically on app startup (via root layout or middleware).
 *
 * Checks performed:
 * 1. MinIO bucket existence and creation
 * 2. Essential database records (pages, menu, sections)
 *
 * Features:
 * - Non-blocking: Won't crash app if initialization fails
 * - Idempotent: Safe to run multiple times
 * - Comprehensive logging: Clear visibility of what's happening
 * - Environment-aware: Can be disabled via env variable
 */

import { ensureMinioBucket } from "./ensure-minio";
import { ensureEssentialData } from "./ensure-essential-data";

// Global flag to prevent multiple simultaneous runs
let isInitializing = false;
let hasInitialized = false;

export interface InitializationResult {
  success: boolean;
  timestamp: Date;
  results: {
    minio: { success: boolean; message: string };
    essentialData: { success: boolean; message: string };
  };
  errors: string[];
}

/**
 * Run all initialization checks
 *
 * @returns Promise<InitializationResult>
 */
export async function initializeApplication(): Promise<InitializationResult> {
  // Prevent concurrent initialization
  if (isInitializing) {
    console.log("⏳ Initialization already in progress, skipping...");
    return {
      success: false,
      timestamp: new Date(),
      results: {
        minio: { success: false, message: "Already in progress" },
        essentialData: { success: false, message: "Already in progress" },
      },
      errors: ["Initialization already in progress"],
    };
  }

  // Skip if already initialized (unless forced)
  if (hasInitialized) {
    console.log("✅ Application already initialized");
    return {
      success: true,
      timestamp: new Date(),
      results: {
        minio: { success: true, message: "Already initialized" },
        essentialData: { success: true, message: "Already initialized" },
      },
      errors: [],
    };
  }

  isInitializing = true;
  const errors: string[] = [];

  console.log("\n🚀 Starting application initialization...\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  try {
    // Step 1: Initialize MinIO bucket
    console.log("📦 STEP 1: MinIO Bucket Setup");
    console.log("────────────────────────────────────────\n");
    const minioResult = await ensureMinioBucket();

    if (!minioResult.success) {
      errors.push(`MinIO: ${minioResult.message}`);
    }

    console.log("\n────────────────────────────────────────\n");

    // Step 2: Initialize essential database records
    console.log("🌱 STEP 2: Essential Data Setup");
    console.log("────────────────────────────────────────\n");
    const dataResult = await ensureEssentialData();

    if (!dataResult.success) {
      errors.push(`Database: ${dataResult.message}`);
    }

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Determine overall success
    const overallSuccess = minioResult.success && dataResult.success;

    if (overallSuccess) {
      console.log("✅ Application initialization complete!\n");
      hasInitialized = true;
    } else {
      console.log("⚠️  Application initialization completed with warnings:\n");
      errors.forEach((error) => console.log(`   - ${error}`));
      console.log();
    }

    return {
      success: overallSuccess,
      timestamp: new Date(),
      results: {
        minio: minioResult,
        essentialData: dataResult,
      },
      errors,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Initialization failed:", errorMessage);
    errors.push(errorMessage);

    return {
      success: false,
      timestamp: new Date(),
      results: {
        minio: { success: false, message: "Not attempted" },
        essentialData: { success: false, message: "Not attempted" },
      },
      errors,
    };
  } finally {
    isInitializing = false;
  }
}

/**
 * Reset initialization state (for testing or forced re-initialization)
 */
export function resetInitializationState(): void {
  hasInitialized = false;
  isInitializing = false;
  console.log("🔄 Initialization state reset");
}

/**
 * Check if application has been initialized
 */
export function isApplicationInitialized(): boolean {
  return hasInitialized;
}

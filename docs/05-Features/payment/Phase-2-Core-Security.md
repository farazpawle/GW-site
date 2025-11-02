# Phase 2: Core Security Libraries

**Status:** 🔴 Not Started  
**Priority:** Critical  
**Dependencies:** Phase 1 Complete  
**Estimated Time:** 2-3 hours

---

## 📋 Overview

This phase implements the core security infrastructure required for safe payment processing. It includes payment settings management, Stripe client initialization, idempotency key handling, and critical webhook signature verification.

**Why This Phase is Critical:**
- 🔒 Webhook signature verification prevents unauthorized access
- 🔒 Idempotency prevents duplicate charges ($$$ safety)
- 🔒 Proper key management ensures PCI compliance
- 🔒 Secure client initialization prevents leaks

---

## 🎯 Objectives

1. ✅ Create payment settings utility with decryption
2. ✅ Initialize Stripe client securely
3. ✅ Implement idempotency key system
4. ✅ Build webhook signature verification
5. ✅ Ensure all secrets handled securely

---

## 📊 Tasks Breakdown

### Task 2.1: Payment Settings Library

**File:** `src/lib/payments/settings.ts`

**Purpose:** Retrieve and decrypt payment gateway settings from database

**Implementation:**

```typescript
import { prisma } from '@/lib/prisma';
import { decryptValue, isSensitiveField } from '@/lib/settings/encryption';

/**
 * Payment gateway configuration interface
 */
export interface PaymentSettings {
  enabled: boolean;
  testMode: boolean;
  gateway: 'stripe' | 'paypal' | 'square';
  stripe?: {
    publishableKey: string;
    secretKey: string;
    webhookSecret: string;
  };
  paypal?: {
    clientId: string;
    clientSecret: string;
    webhookId: string;
  };
  square?: {
    applicationId: string;
    accessToken: string;
    webhookSignatureKey: string;
  };
}

/**
 * Get payment settings with decrypted sensitive keys
 * 
 * @returns Payment configuration object
 * @throws Error if payment system not configured
 */
export async function getPaymentSettings(): Promise<PaymentSettings> {
  try {
    // Fetch all payment-related settings
    const settings = await prisma.settings.findMany({
      where: {
        category: 'PAYMENT'
      }
    });

    if (settings.length === 0) {
      throw new Error('Payment system not configured. Please configure in Admin Settings.');
    }

    // Convert to key-value map
    const settingsMap = new Map<string, string>();
    for (const setting of settings) {
      const value = isSensitiveField(setting.key)
        ? decryptValue(setting.value)
        : setting.value;
      settingsMap.set(setting.key, value);
    }

    // Get gateway type
    const gateway = settingsMap.get('payment_gateway') as 'stripe' | 'paypal' | 'square';
    
    if (!gateway) {
      throw new Error('Payment gateway not selected');
    }

    // Build configuration object
    const config: PaymentSettings = {
      enabled: settingsMap.get('payment_enabled') === 'true',
      testMode: settingsMap.get('payment_test_mode') === 'true',
      gateway
    };

    // Add gateway-specific config
    if (gateway === 'stripe') {
      const publishableKey = settingsMap.get('payment_stripe_publishable_key');
      const secretKey = settingsMap.get('payment_stripe_secret_key');
      const webhookSecret = settingsMap.get('payment_stripe_webhook_secret');

      if (!publishableKey || !secretKey) {
        throw new Error('Stripe keys not configured');
      }

      config.stripe = {
        publishableKey,
        secretKey,
        webhookSecret: webhookSecret || ''
      };
    }

    return config;
  } catch (error) {
    console.error('Error fetching payment settings:', error);
    throw new Error(
      `Failed to load payment settings: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Check if payment system is enabled
 */
export async function isPaymentEnabled(): Promise<boolean> {
  try {
    const settings = await getPaymentSettings();
    return settings.enabled;
  } catch {
    return false;
  }
}

/**
 * Get active payment gateway
 */
export async function getActiveGateway(): Promise<'stripe' | 'paypal' | 'square' | null> {
  try {
    const settings = await getPaymentSettings();
    return settings.enabled ? settings.gateway : null;
  } catch {
    return null;
  }
}
```

**Verification:**
- [ ] Function retrieves settings from database
- [ ] Decrypts sensitive keys correctly
- [ ] Throws clear errors for missing config
- [ ] Returns type-safe configuration object
- [ ] No sensitive data in error messages
- [ ] Works with all gateway types

---

### Task 2.2: Stripe Client Initialization

**File:** `src/lib/payments/stripe.ts`

**Purpose:** Securely initialize and manage Stripe client instance

**Implementation:**

```typescript
import Stripe from 'stripe';
import { getPaymentSettings } from './settings';

/**
 * Singleton Stripe client instance
 */
let stripeClient: Stripe | null = null;

/**
 * Get or create Stripe client instance
 * Uses singleton pattern to avoid multiple initializations
 * 
 * @returns Initialized Stripe client
 * @throws Error if Stripe not configured
 */
export async function getStripeClient(): Promise<Stripe> {
  // Return existing client if available
  if (stripeClient) {
    return stripeClient;
  }

  try {
    const settings = await getPaymentSettings();

    // Verify Stripe is the active gateway
    if (settings.gateway !== 'stripe') {
      throw new Error('Stripe is not the active payment gateway');
    }

    if (!settings.stripe) {
      throw new Error('Stripe configuration not found');
    }

    // Initialize Stripe with secret key
    stripeClient = new Stripe(settings.stripe.secretKey, {
      apiVersion: '2024-12-18.acacia', // Latest stable version
      typescript: true,
      telemetry: false, // Disable for privacy
      appInfo: {
        name: 'Garrit Wulf Auto Parts',
        version: '1.0.0',
        url: 'https://garritwulf.com'
      }
    });

    // Log initialization (without sensitive data)
    console.log('[Stripe] Client initialized', {
      testMode: settings.testMode,
      apiVersion: '2024-12-18.acacia'
    });

    return stripeClient;
  } catch (error) {
    console.error('[Stripe] Initialization failed:', error);
    throw new Error(
      `Failed to initialize Stripe: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Check if Stripe is in test mode
 */
export async function isStripeTestMode(): Promise<boolean> {
  try {
    const settings = await getPaymentSettings();
    return settings.testMode;
  } catch {
    return true; // Default to test mode for safety
  }
}

/**
 * Reset Stripe client (useful for testing or config changes)
 */
export function resetStripeClient(): void {
  stripeClient = null;
  console.log('[Stripe] Client reset');
}
```

**Verification:**
- [ ] Singleton pattern prevents multiple instances
- [ ] Uses latest stable Stripe API version
- [ ] Initializes with correct secret key
- [ ] Test mode detection works
- [ ] Clear error messages
- [ ] No key leakage in logs
- [ ] TypeScript types correct

---

### Task 2.3: Idempotency Key Manager

**File:** `src/lib/payments/idempotency.ts`

**Purpose:** Generate and validate idempotency keys to prevent duplicate charges

**Implementation:**

```typescript
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';

/**
 * Generate a new idempotency key (UUID v4)
 * 
 * @returns Unique UUID string
 */
export function generateIdempotencyKey(): string {
  return randomUUID();
}

/**
 * Check if idempotency key was already used
 * Returns existing payment if found
 * 
 * @param key - Idempotency key to check
 * @returns Existing payment or null
 */
export async function checkIdempotency(key: string) {
  try {
    const existingPayment = await prisma.payment.findUnique({
      where: { idempotencyKey: key },
      include: {
        order: true,
        refunds: true
      }
    });

    if (existingPayment) {
      console.log('[Idempotency] Duplicate request detected', {
        paymentId: existingPayment.id,
        idempotencyKey: key,
        status: existingPayment.status
      });
    }

    return existingPayment;
  } catch (error) {
    console.error('[Idempotency] Check failed:', error);
    throw new Error('Failed to check idempotency');
  }
}

/**
 * Validate idempotency key format
 * 
 * @param key - Key to validate
 * @returns true if valid UUID v4
 */
export function isValidIdempotencyKey(key: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(key);
}

/**
 * Create idempotent payment with automatic retry handling
 * 
 * @param key - Idempotency key (or generate new one)
 * @param createFn - Function to create payment if key is new
 * @returns Payment object (existing or newly created)
 */
export async function withIdempotency<T>(
  key: string | undefined,
  createFn: (idempotencyKey: string) => Promise<T>
): Promise<T> {
  // Generate key if not provided
  const idempotencyKey = key || generateIdempotencyKey();

  // Validate format
  if (!isValidIdempotencyKey(idempotencyKey)) {
    throw new Error('Invalid idempotency key format');
  }

  // Check for existing payment
  const existing = await checkIdempotency(idempotencyKey);
  if (existing) {
    return existing as T;
  }

  // Create new payment
  try {
    return await createFn(idempotencyKey);
  } catch (error) {
    // Check if error is due to duplicate key constraint
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      // Race condition: another request created it
      const retry = await checkIdempotency(idempotencyKey);
      if (retry) {
        return retry as T;
      }
    }
    throw error;
  }
}
```

**Verification:**
- [ ] Generates valid UUID v4 keys
- [ ] Detects duplicate requests
- [ ] Returns existing payment on retry
- [ ] Handles race conditions
- [ ] Validates key format
- [ ] Works with database unique constraint
- [ ] Logs duplicate attempts (for monitoring)

---

### Task 2.4: Webhook Signature Verification

**File:** `src/lib/payments/webhooks.ts`

**Purpose:** Verify webhook signatures to prevent unauthorized requests

**Implementation:**

```typescript
import Stripe from 'stripe';
import { getStripeClient, getPaymentSettings } from './stripe';
import { prisma } from '@/lib/prisma';

/**
 * Verify Stripe webhook signature
 * CRITICAL SECURITY FUNCTION - Always verify before processing
 * 
 * @param payload - Raw request body (as string or Buffer)
 * @param signature - Stripe-Signature header value
 * @returns Verified Stripe event object
 * @throws Error if signature invalid
 */
export async function verifyStripeWebhook(
  payload: string | Buffer,
  signature: string
): Promise<Stripe.Event> {
  try {
    const stripe = await getStripeClient();
    const settings = await getPaymentSettings();

    if (!settings.stripe?.webhookSecret) {
      throw new Error('Webhook secret not configured');
    }

    // Verify signature and construct event
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      settings.stripe.webhookSecret
    );

    console.log('[Webhook] Signature verified', {
      eventId: event.id,
      eventType: event.type
    });

    return event;
  } catch (error) {
    console.error('[Webhook] Signature verification failed:', error);
    
    // Log failed verification attempt (security audit)
    await logWebhookAttempt({
      provider: 'STRIPE',
      payload: typeof payload === 'string' ? payload : payload.toString(),
      signature,
      verified: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }).catch(console.error);

    throw new Error(
      `Webhook signature verification failed: ${error instanceof Error ? error.message : 'Invalid signature'}`
    );
  }
}

/**
 * Log webhook attempt to database (for audit trail)
 */
async function logWebhookAttempt(data: {
  provider: 'STRIPE' | 'PAYPAL' | 'SQUARE';
  payload: string;
  signature: string;
  verified: boolean;
  error?: string;
}) {
  try {
    await prisma.webhookLog.create({
      data: {
        provider: data.provider,
        eventType: 'verification_attempt',
        eventId: `verify_${Date.now()}`,
        payload: JSON.parse(data.payload),
        signature: data.signature,
        verified: data.verified,
        error: data.error,
        processed: false
      }
    });
  } catch (error) {
    console.error('[Webhook] Failed to log attempt:', error);
  }
}

/**
 * Check if webhook event was already processed (prevent replay attacks)
 * 
 * @param eventId - Stripe event ID
 * @returns true if already processed
 */
export async function isWebhookProcessed(eventId: string): Promise<boolean> {
  const existing = await prisma.webhookLog.findUnique({
    where: { eventId }
  });

  return existing?.processed || false;
}

/**
 * Mark webhook as processed
 */
export async function markWebhookProcessed(
  eventId: string,
  error?: string
): Promise<void> {
  await prisma.webhookLog.updateMany({
    where: { eventId },
    data: {
      processed: true,
      processedAt: new Date(),
      error
    }
  });
}
```

**Verification:**
- [ ] Verifies Stripe signatures correctly
- [ ] Rejects invalid signatures
- [ ] Returns typed Stripe event
- [ ] Logs failed attempts
- [ ] Prevents replay attacks
- [ ] Marks events as processed
- [ ] Clear error messages

---

## 🔒 Security Best Practices Implemented

### 1. **Secure Key Management**
- ✅ Keys retrieved from encrypted database
- ✅ No hardcoded credentials
- ✅ No keys in logs or error messages
- ✅ Singleton pattern prevents re-initialization

### 2. **Webhook Security**
- ✅ Signature verification is mandatory
- ✅ Failed attempts logged for audit
- ✅ Event ID deduplication
- ✅ Replay attack prevention

### 3. **Idempotency**
- ✅ UUID v4 for uniqueness
- ✅ Database unique constraint
- ✅ Race condition handling
- ✅ Automatic retry support

### 4. **Error Handling**
- ✅ Never expose sensitive data
- ✅ Clear, actionable error messages
- ✅ Proper logging for debugging
- ✅ Graceful degradation

---

## ✅ Phase Completion Checklist

### Payment Settings
- [ ] `settings.ts` created
- [ ] Decryption works correctly
- [ ] All gateway types supported
- [ ] Error handling comprehensive
- [ ] Type-safe interfaces

### Stripe Client
- [ ] `stripe.ts` created
- [ ] Singleton pattern implemented
- [ ] Latest API version used
- [ ] Test mode detection works
- [ ] Reset function available

### Idempotency
- [ ] `idempotency.ts` created
- [ ] UUID generation works
- [ ] Duplicate detection works
- [ ] Race conditions handled
- [ ] Validation function works

### Webhook Security
- [ ] `webhooks.ts` created
- [ ] Signature verification works
- [ ] Event logging implemented
- [ ] Replay prevention works
- [ ] Processing tracking works

---

## 🧪 Testing

### Manual Tests

```typescript
// Test 1: Get payment settings
const settings = await getPaymentSettings();
console.log('Settings:', settings);

// Test 2: Initialize Stripe
const stripe = await getStripeClient();
console.log('Stripe initialized:', !!stripe);

// Test 3: Generate idempotency key
const key = generateIdempotencyKey();
console.log('Key valid:', isValidIdempotencyKey(key));

// Test 4: Verify webhook (use Stripe CLI)
// stripe trigger payment_intent.succeeded
```

### Unit Tests (Future)
- Payment settings retrieval
- Stripe client initialization
- Idempotency key validation
- Webhook signature verification

---

## 📚 Additional Resources

- [Stripe Webhook Security](https://stripe.com/docs/webhooks/signatures)
- [Idempotency Keys Best Practices](https://stripe.com/docs/api/idempotent_requests)
- [Node.js Crypto Module](https://nodejs.org/api/crypto.html)

---

**Next Phase:** [Phase 3: API Routes](./Phase-3-API-Routes.md)

**Status Update:** Ready to begin after Phase 1 completion

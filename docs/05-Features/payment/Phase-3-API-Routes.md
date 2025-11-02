# Phase 3: API Routes Implementation

**Status:** 🔴 Not Started  
**Priority:** High  
**Dependencies:** Phase 1 + Phase 2 Complete  
**Estimated Time:** 4-5 hours

---

## 📋 Overview

This phase implements all API routes for payment processing, including:
- Payment Intent creation (checkout initiation)
- Webhook handler (Stripe event processing)
- Payment details retrieval (status checking)
- Refund processing (customer service)

**Why This Phase is Critical:**
- 💰 Handles actual money transactions
- 🔒 Must be PCI DSS compliant
- 🛡️ Security vulnerabilities = financial loss
- ⚡ Performance impacts customer experience

---

## 🎯 Objectives

1. ✅ Implement Payment Intent creation API
2. ✅ Build secure webhook handler
3. ✅ Create payment details endpoint
4. ✅ Implement refund processing
5. ✅ Ensure all routes are protected
6. ✅ Add comprehensive error handling

---

## 📊 Tasks Breakdown

### Task 3.1: Create Payment Intent API

**File:** `src/app/api/payments/create-intent/route.ts`

**Purpose:** Initialize payment with Stripe (checkout flow start)

**Implementation:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { getStripeClient } from '@/lib/payments/stripe';
import { generateIdempotencyKey, withIdempotency } from '@/lib/payments/idempotency';
import { prisma } from '@/lib/prisma';

/**
 * Request schema validation
 */
const CreateIntentSchema = z.object({
  orderId: z.string().uuid(),
  amount: z.number().positive().int(), // Amount in cents
  currency: z.string().length(3).toLowerCase().default('usd'),
  customerId: z.string().uuid(),
  idempotencyKey: z.string().uuid().optional(),
  metadata: z.record(z.string()).optional()
});

/**
 * POST /api/payments/create-intent
 * 
 * Create a Stripe Payment Intent for an order
 * 
 * Request Body:
 * {
 *   orderId: string (UUID)
 *   amount: number (cents)
 *   currency: string (ISO 4217)
 *   customerId: string (UUID)
 *   idempotencyKey?: string (UUID)
 *   metadata?: Record<string, string>
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   clientSecret: string,
 *   paymentIntentId: string,
 *   paymentId: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request
    const body = await request.json();
    const validatedData = CreateIntentSchema.parse(body);

    // Verify order exists and belongs to customer
    const order = await prisma.order.findUnique({
      where: { id: validatedData.orderId },
      include: { customer: true, items: true }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.customerId !== validatedData.customerId) {
      return NextResponse.json(
        { success: false, error: 'Customer mismatch' },
        { status: 403 }
      );
    }

    // Verify amount matches order total
    const orderTotal = Math.round(order.totalAmount * 100); // Convert to cents
    if (validatedData.amount !== orderTotal) {
      return NextResponse.json(
        { success: false, error: 'Amount mismatch' },
        { status: 400 }
      );
    }

    // Check for existing payment
    const existingPayment = await prisma.payment.findFirst({
      where: {
        orderId: order.id,
        status: { in: ['PENDING', 'SUCCEEDED'] }
      }
    });

    if (existingPayment) {
      return NextResponse.json(
        {
          success: true,
          clientSecret: existingPayment.clientSecret,
          paymentIntentId: existingPayment.transactionId,
          paymentId: existingPayment.id,
          message: 'Payment already exists'
        },
        { status: 200 }
      );
    }

    // Create payment with idempotency
    const payment = await withIdempotency(
      validatedData.idempotencyKey,
      async (idempotencyKey) => {
        // Initialize Stripe
        const stripe = await getStripeClient();

        // Create Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: validatedData.amount,
          currency: validatedData.currency,
          metadata: {
            orderId: order.id,
            customerId: order.customerId,
            customerEmail: order.customer.email,
            ...validatedData.metadata
          },
          automatic_payment_methods: {
            enabled: true,
            allow_redirects: 'never' // Ensure card-only
          }
        }, {
          idempotencyKey // Stripe-level idempotency
        });

        // Save to database
        const dbPayment = await prisma.payment.create({
          data: {
            orderId: order.id,
            customerId: order.customerId,
            provider: 'STRIPE',
            amount: validatedData.amount / 100, // Convert back to dollars
            currency: validatedData.currency.toUpperCase(),
            status: 'PENDING',
            transactionId: paymentIntent.id,
            clientSecret: paymentIntent.client_secret!,
            idempotencyKey,
            metadata: validatedData.metadata || {}
          }
        });

        console.log('[Payment] Intent created', {
          paymentId: dbPayment.id,
          orderId: order.id,
          amount: validatedData.amount,
          paymentIntentId: paymentIntent.id
        });

        return dbPayment;
      }
    );

    return NextResponse.json(
      {
        success: true,
        clientSecret: payment.clientSecret,
        paymentIntentId: payment.transactionId,
        paymentId: payment.id
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[Payment] Intent creation failed:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create payment intent'
      },
      { status: 500 }
    );
  }
}
```

**Verification:**
- [ ] Creates Payment Intent in Stripe
- [ ] Saves payment record to database
- [ ] Validates order and amount
- [ ] Handles idempotency correctly
- [ ] Returns client secret securely
- [ ] Proper error handling
- [ ] Authentication required

---

### Task 3.2: Webhook Handler API

**File:** `src/app/api/webhooks/stripe/route.ts`

**Purpose:** Process Stripe webhook events (payment confirmations, failures)

**Implementation:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { verifyStripeWebhook, isWebhookProcessed, markWebhookProcessed } from '@/lib/payments/webhooks';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/webhooks/stripe
 * 
 * Handle Stripe webhook events
 * 
 * Headers Required:
 * - stripe-signature: Webhook signature for verification
 * 
 * Events Handled:
 * - payment_intent.succeeded
 * - payment_intent.payment_failed
 * - charge.refunded
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body and signature
    const payload = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('[Webhook] Missing signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature (CRITICAL SECURITY)
    let event: Stripe.Event;
    try {
      event = await verifyStripeWebhook(payload, signature);
    } catch (error) {
      console.error('[Webhook] Signature verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Check if already processed (prevent replay attacks)
    const alreadyProcessed = await isWebhookProcessed(event.id);
    if (alreadyProcessed) {
      console.log('[Webhook] Event already processed', { eventId: event.id });
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Log webhook event
    await prisma.webhookLog.create({
      data: {
        provider: 'STRIPE',
        eventType: event.type,
        eventId: event.id,
        payload: event.data.object as any,
        signature,
        verified: true,
        processed: false
      }
    });

    // Process event by type
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event);
        break;

      default:
        console.log('[Webhook] Unhandled event type', { type: event.type });
    }

    // Mark as processed
    await markWebhookProcessed(event.id);

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error('[Webhook] Processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle payment_intent.succeeded event
 */
async function handlePaymentSucceeded(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  console.log('[Webhook] Payment succeeded', {
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount
  });

  // Update payment status
  await prisma.payment.updateMany({
    where: { transactionId: paymentIntent.id },
    data: {
      status: 'SUCCEEDED',
      paidAt: new Date(),
      metadata: {
        chargeId: paymentIntent.charges.data[0]?.id,
        receiptUrl: paymentIntent.charges.data[0]?.receipt_url
      }
    }
  });

  // Update order status
  const payment = await prisma.payment.findFirst({
    where: { transactionId: paymentIntent.id }
  });

  if (payment) {
    await prisma.order.update({
      where: { id: payment.orderId },
      data: {
        status: 'PAID',
        paidAt: new Date()
      }
    });
  }
}

/**
 * Handle payment_intent.payment_failed event
 */
async function handlePaymentFailed(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  console.error('[Webhook] Payment failed', {
    paymentIntentId: paymentIntent.id,
    error: paymentIntent.last_payment_error?.message
  });

  // Update payment status
  await prisma.payment.updateMany({
    where: { transactionId: paymentIntent.id },
    data: {
      status: 'FAILED',
      errorMessage: paymentIntent.last_payment_error?.message || 'Payment failed',
      failedAt: new Date()
    }
  });

  // Update order status
  const payment = await prisma.payment.findFirst({
    where: { transactionId: paymentIntent.id }
  });

  if (payment) {
    await prisma.order.update({
      where: { id: payment.orderId },
      data: {
        status: 'PAYMENT_FAILED'
      }
    });
  }
}

/**
 * Handle charge.refunded event
 */
async function handleChargeRefunded(event: Stripe.Event) {
  const charge = event.data.object as Stripe.Charge;

  console.log('[Webhook] Charge refunded', {
    chargeId: charge.id,
    amount: charge.amount_refunded
  });

  // Find payment by charge ID
  const payment = await prisma.payment.findFirst({
    where: {
      metadata: {
        path: ['chargeId'],
        equals: charge.id
      }
    }
  });

  if (!payment) {
    console.error('[Webhook] Payment not found for charge', { chargeId: charge.id });
    return;
  }

  // Check if full refund
  const isFullRefund = charge.amount_refunded === charge.amount;

  // Update payment status
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
      refundedAmount: charge.amount_refunded / 100
    }
  });

  // Update order status
  if (isFullRefund) {
    await prisma.order.update({
      where: { id: payment.orderId },
      data: { status: 'REFUNDED' }
    });
  }
}

/**
 * Disable body parsing (needed for raw body)
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
```

**Verification:**
- [ ] Verifies webhook signatures
- [ ] Prevents replay attacks
- [ ] Logs all events
- [ ] Updates payment status
- [ ] Updates order status
- [ ] Handles all event types
- [ ] Returns 200 OK quickly

---

### Task 3.3: Payment Details API

**File:** `src/app/api/payments/[id]/route.ts`

**Purpose:** Get payment status and details

**Implementation:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

/**
 * GET /api/payments/[id]
 * 
 * Get payment details by ID
 * 
 * Access Control:
 * - Admins: Can view any payment
 * - Users: Can only view their own payments
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await getCurrentUser();
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

    // Fetch payment
    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: {
        order: {
          include: {
            items: {
              include: {
                part: true
              }
            }
          }
        },
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        refunds: true
      }
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Authorization check (non-admins can only view own payments)
    if (!isAdmin && payment.customer.email !== user?.emailAddresses[0]?.emailAddress) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Return payment data
    return NextResponse.json(
      {
        success: true,
        payment: {
          id: payment.id,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          provider: payment.provider,
          transactionId: payment.transactionId,
          paidAt: payment.paidAt,
          failedAt: payment.failedAt,
          refundedAmount: payment.refundedAmount,
          errorMessage: payment.errorMessage,
          order: {
            id: payment.order.id,
            orderNumber: payment.order.orderNumber,
            totalAmount: payment.order.totalAmount,
            status: payment.order.status,
            items: payment.order.items.map(item => ({
              id: item.id,
              partNumber: item.part.partNumber,
              description: item.part.description,
              quantity: item.quantity,
              price: item.price
            }))
          },
          customer: payment.customer,
          refunds: payment.refunds.map(refund => ({
            id: refund.id,
            amount: refund.amount,
            reason: refund.reason,
            status: refund.status,
            createdAt: refund.createdAt
          }))
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[Payment] Fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch payment'
      },
      { status: 500 }
    );
  }
}
```

**Verification:**
- [ ] Fetches payment by ID
- [ ] Includes order details
- [ ] Includes refund history
- [ ] Admin can view all payments
- [ ] Users can only view own payments
- [ ] Returns comprehensive data
- [ ] Proper error handling

---

### Task 3.4: Refund Processing API

**File:** `src/app/api/payments/[id]/refund/route.ts`

**Purpose:** Process full or partial refunds (admin only)

**Implementation:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { getStripeClient } from '@/lib/payments/stripe';
import { prisma } from '@/lib/prisma';

/**
 * Request schema validation
 */
const RefundSchema = z.object({
  amount: z.number().positive().optional(), // If omitted, full refund
  reason: z.enum(['DUPLICATE', 'FRAUDULENT', 'CUSTOMER_REQUEST', 'OTHER']),
  notes: z.string().max(500).optional()
});

/**
 * POST /api/payments/[id]/refund
 * 
 * Process a refund (admin only)
 * 
 * Request Body:
 * {
 *   amount?: number (dollars, omit for full refund)
 *   reason: 'DUPLICATE' | 'FRAUDULENT' | 'CUSTOMER_REQUEST' | 'OTHER'
 *   notes?: string
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Admin authentication required
    await requireAdmin();

    // Parse and validate request
    const body = await request.json();
    const validatedData = RefundSchema.parse(body);

    // Fetch payment
    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: { order: true }
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Verify payment can be refunded
    if (payment.status !== 'SUCCEEDED' && payment.status !== 'PARTIALLY_REFUNDED') {
      return NextResponse.json(
        { success: false, error: 'Payment cannot be refunded' },
        { status: 400 }
      );
    }

    // Calculate refund amount
    const maxRefundable = payment.amount - (payment.refundedAmount || 0);
    const refundAmount = validatedData.amount || maxRefundable;

    if (refundAmount > maxRefundable) {
      return NextResponse.json(
        { success: false, error: 'Refund amount exceeds available balance' },
        { status: 400 }
      );
    }

    // Process refund with Stripe
    const stripe = await getStripeClient();
    const refund = await stripe.refunds.create({
      payment_intent: payment.transactionId,
      amount: Math.round(refundAmount * 100), // Convert to cents
      reason: validatedData.reason.toLowerCase() as any,
      metadata: {
        paymentId: payment.id,
        orderId: payment.orderId,
        notes: validatedData.notes || ''
      }
    });

    // Save refund to database
    const dbRefund = await prisma.refund.create({
      data: {
        paymentId: payment.id,
        amount: refundAmount,
        currency: payment.currency,
        provider: 'STRIPE',
        refundId: refund.id,
        reason: validatedData.reason,
        status: refund.status === 'succeeded' ? 'SUCCEEDED' : 'PENDING',
        notes: validatedData.notes,
        processedBy: 'admin', // TODO: Get actual admin user ID
        processedAt: new Date()
      }
    });

    // Update payment refunded amount
    const newRefundedTotal = (payment.refundedAmount || 0) + refundAmount;
    const isFullRefund = newRefundedTotal >= payment.amount;

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        refundedAmount: newRefundedTotal,
        status: isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED'
      }
    });

    // Update order status if fully refunded
    if (isFullRefund) {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'REFUNDED' }
      });
    }

    console.log('[Refund] Processed', {
      paymentId: payment.id,
      refundId: dbRefund.id,
      amount: refundAmount,
      isFullRefund
    });

    return NextResponse.json(
      {
        success: true,
        refund: {
          id: dbRefund.id,
          amount: dbRefund.amount,
          status: dbRefund.status,
          reason: dbRefund.reason,
          refundId: dbRefund.refundId
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[Refund] Processing error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process refund'
      },
      { status: 500 }
    );
  }
}
```

**Verification:**
- [ ] Admin authentication required
- [ ] Validates refund amount
- [ ] Processes refund with Stripe
- [ ] Saves refund to database
- [ ] Updates payment status
- [ ] Updates order status
- [ ] Handles partial/full refunds

---

## 🔒 Security Checklist

### Authentication & Authorization
- [ ] All routes require authentication
- [ ] Admin routes use `requireAdmin()`
- [ ] Users can only access own data
- [ ] Webhook signature verification mandatory

### Data Validation
- [ ] All inputs validated with Zod schemas
- [ ] Amount matches order total
- [ ] Order ownership verified
- [ ] Refund amounts validated

### Error Handling
- [ ] No sensitive data in error messages
- [ ] Proper HTTP status codes
- [ ] Comprehensive logging
- [ ] Graceful failure handling

### Idempotency
- [ ] Payment creation uses idempotency keys
- [ ] Webhook events checked for duplicates
- [ ] Race conditions handled

---

## ✅ Phase Completion Checklist

- [ ] All 4 API routes created
- [ ] Payment intent creation works
- [ ] Webhook processing works
- [ ] Payment details retrieval works
- [ ] Refund processing works
- [ ] All routes authenticated
- [ ] All inputs validated
- [ ] Comprehensive error handling
- [ ] Logging implemented

---

## 🧪 Testing

### Manual Tests

```bash
# Test 1: Create payment intent
curl -X POST http://localhost:3000/api/payments/create-intent \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "uuid-here",
    "amount": 5000,
    "currency": "usd",
    "customerId": "uuid-here"
  }'

# Test 2: Webhook (use Stripe CLI)
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger payment_intent.succeeded

# Test 3: Get payment details
curl http://localhost:3000/api/payments/{payment-id}

# Test 4: Process refund
curl -X POST http://localhost:3000/api/payments/{payment-id}/refund \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "CUSTOMER_REQUEST",
    "notes": "Customer requested refund"
  }'
```

---

**Next Phase:** [Phase 4: Admin UI](./Phase-4-Admin-UI.md)

**Status Update:** Ready to begin after Phase 2 completion

import { NextRequest, NextResponse } from 'next/server';

/**
 * A/B Test Analytics Endpoint
 * Receives and logs A/B test events
 * 
 * POST /api/analytics/ab-test
 */

interface ABTestEvent {
  event: 'ab_test_assigned' | 'ab_test_conversion';
  testId: string;
  variant: string;
  pathname: string;
  timestamp: number;
  conversion_type?: string;
  conversion_value?: number;
}

export async function POST(request: NextRequest) {
  try {
    const event: ABTestEvent = await request.json();

    // Validate required fields
    if (!event.testId || !event.variant || !event.event) {
      return NextResponse.json(
        { error: 'Invalid event data' },
        { status: 400 }
      );
    }

    // Log the event
    console.log('[A/B Test]', {
      event: event.event,
      test: event.testId,
      variant: event.variant,
      path: event.pathname,
      ...(event.conversion_type && { conversion: event.conversion_type }),
      ...(event.conversion_value && { value: event.conversion_value }),
    });

    // In production, you would:
    // 1. Store events in database
    // 2. Send to analytics platform
    // 3. Calculate conversion rates
    // 4. Determine winning variants

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('[A/B Test API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

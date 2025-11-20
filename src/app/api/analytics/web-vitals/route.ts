import { NextRequest, NextResponse } from 'next/server';

/**
 * Web Vitals Analytics Endpoint
 * Receives and stores Core Web Vitals metrics
 * 
 * POST /api/analytics/web-vitals
 */

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
  pathname: string;
  userAgent: string;
  timestamp: number;
}

export async function POST(request: NextRequest) {
  try {
    const metric: WebVitalMetric = await request.json();

    // Validate required fields
    if (!metric.name || typeof metric.value !== 'number' || !metric.pathname) {
      return NextResponse.json(
        { error: 'Invalid metric data' },
        { status: 400 }
      );
    }

    // Store in database (optional - you may want to use a separate analytics DB)
    // For now, we'll just log it
    // In production, consider using:
    // - Google Analytics
    // - Custom analytics database
    // - Third-party services (Vercel Analytics, etc.)

    console.log('[Web Vitals]', {
      metric: metric.name,
      value: metric.value,
      rating: metric.rating,
      path: metric.pathname,
    });

    // Return success
    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Web Vitals API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getProductCardSettings } from '@/lib/settings';

/**
 * Get Product Card Display Settings
 * Public API endpoint that returns which fields should be visible on product cards
 */
export async function GET() {
  try {
    const settings = await getProductCardSettings();
    
    return NextResponse.json(
      {
        success: true,
        data: settings,
      },
      {
        headers: {
          // Prevent caching - always fetch fresh
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  } catch (error) {
    console.error('Error fetching product card settings:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch product card settings',
      },
      { status: 500 }
    );
  }
}

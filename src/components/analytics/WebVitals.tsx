'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Web Vitals Performance Monitoring Component
 * 
 * Tracks Core Web Vitals and sends data to analytics endpoint
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay) / INP (Interaction to Next Paint)
 * - CLS (Cumulative Layout Shift)
 * - FCP (First Contentful Paint)
 * - TTFB (Time to First Byte)
 */

interface Metric {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  navigationType: string;
}

export default function WebVitals() {
  const pathname = usePathname();

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // Import web-vitals library dynamically
    import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
      // Core Web Vitals
      onCLS(sendToAnalytics);
      onLCP(sendToAnalytics);
      
      // Additional metrics
      onFCP(sendToAnalytics);
      onTTFB(sendToAnalytics);
      onINP(sendToAnalytics);
    }).catch((error) => {
      console.error('Failed to load web-vitals:', error);
    });
  }, [pathname]);

  const sendToAnalytics = (metric: Metric) => {
    // Send to custom analytics endpoint
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
      pathname: pathname,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    });

    // Use sendBeacon if available (non-blocking)
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/web-vitals', body);
    } else {
      // Fallback to fetch
      fetch('/api/analytics/web-vitals', {
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'application/json',
        },
        keepalive: true,
      }).catch((error) => {
        console.error('Failed to send web vitals:', error);
      });
    }

    // Also send to Google Analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_label: metric.id,
        non_interaction: true,
      });
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Web Vitals] ${metric.name}:`, {
        value: metric.value,
        rating: metric.rating,
        pathname,
      });
    }
  };

  // This component doesn't render anything
  return null;
}

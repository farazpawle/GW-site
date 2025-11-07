'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * A/B Testing Component
 * 
 * Lightweight client-side A/B testing framework
 * Integrates with Google Analytics for event tracking
 * 
 * Usage:
 * <ABTest
 *   testId="homepage_hero"
 *   variants={['control', 'variant_a', 'variant_b']}
 *   onVariantAssigned={(variant) => console.log('Assigned:', variant)}
 * />
 */

interface ABTestProps {
  testId: string;
  variants: string[];
  children?: (variant: string) => React.ReactNode;
  onVariantAssigned?: (variant: string) => void;
}

export default function ABTest({ testId, variants, children, onVariantAssigned }: ABTestProps) {
  const pathname = usePathname();
  const [assignedVariant, setAssignedVariant] = useState<string | null>(null);

  useEffect(() => {
    // Check if user already has a variant assigned (from localStorage)
    const storageKey = `ab_test_${testId}`;
    let variant = localStorage.getItem(storageKey);

    // If no variant assigned, assign one randomly
    if (!variant || !variants.includes(variant)) {
      const randomIndex = Math.floor(Math.random() * variants.length);
      variant = variants[randomIndex];
      localStorage.setItem(storageKey, variant);
    }

    setAssignedVariant(variant);

    // Track variant assignment
    trackEvent('ab_test_assigned', {
      test_id: testId,
      variant,
      pathname,
    });

    // Call callback
    if (onVariantAssigned) {
      onVariantAssigned(variant);
    }
  }, [testId, variants, pathname, onVariantAssigned]);

  const trackEvent = (eventName: string, params: Record<string, any>) => {
    // Send to Google Analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, params);
    }

    // Send to custom analytics endpoint
    fetch('/api/analytics/ab-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: eventName,
        testId,
        variant: params.variant,
        pathname,
        timestamp: Date.now(),
      }),
    }).catch(console.error);
  };

  // Track conversion events
  useEffect(() => {
    if (!assignedVariant) return;

    const handleConversion = (event: CustomEvent) => {
      trackEvent('ab_test_conversion', {
        test_id: testId,
        variant: assignedVariant,
        conversion_type: event.detail.type,
        conversion_value: event.detail.value,
      });
    };

    window.addEventListener('ab_conversion' as any, handleConversion);
    return () => window.removeEventListener('ab_conversion' as any, handleConversion);
  }, [testId, assignedVariant]);

  if (!assignedVariant) return null;

  // Render children with variant
  if (children) {
    return <>{children(assignedVariant)}</>;
  }

  // Or expose variant via data attribute
  return <div data-ab-test={testId} data-ab-variant={assignedVariant} />;
}

/**
 * Helper function to track conversions
 * Call this when user completes desired action
 * 
 * Example:
 * trackABConversion('purchase', 99.99);
 */
export function trackABConversion(type: string, value?: number) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('ab_conversion', {
        detail: { type, value },
      })
    );
  }
}

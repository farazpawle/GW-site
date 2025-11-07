'use client';

import Script from 'next/script';

interface GoogleAnalyticsProps {
  gaId: string;
}

/**
 * Google Analytics 4 (GA4) tracking component
 * 
 * Injects the gtag.js script and initializes GA4 tracking.
 * Should be placed in the root layout.
 * 
 * @param gaId - Google Analytics Measurement ID (format: G-XXXXXXXXXX)
 */
export default function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  if (!gaId || gaId.trim() === '') {
    return null;
  }

  // Validate GA4 format (G-XXXXXXXXXX) or Universal Analytics (UA-XXXXXXXX-X)
  const isGA4 = gaId.startsWith('G-');
  const isUA = gaId.startsWith('UA-');

  if (!isGA4 && !isUA) {
    console.warn(`[GoogleAnalytics] Invalid Analytics ID format: ${gaId}. Expected G-XXXXXXXXXX (GA4) or UA-XXXXXXXX-X (Universal Analytics)`);
    return null;
  }

  return (
    <>
      {/* Load the gtag.js library */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />

      {/* Initialize gtag and configure GA */}
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
              send_page_view: true
            });
          `,
        }}
      />
    </>
  );
}

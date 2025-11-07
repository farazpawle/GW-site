import type { Metadata } from "next";
import { Geist, Geist_Mono, Oswald, Aclonica } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { getSetting } from "@/lib/settings/settings-manager";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import GoogleTagManager from "@/components/analytics/GoogleTagManager";
import WebVitals from "@/components/analytics/WebVitals";
import "@/lib/env"; // Validate environment variables at startup
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
});

const aclonica = Aclonica({
  variable: "--font-aclonica",
  subsets: ["latin"],
  weight: "400",
});

/**
 * Generate dynamic metadata from settings
 * Falls back to hardcoded defaults if settings not found
 */
export async function generateMetadata(): Promise<Metadata> {
  // Fetch SEO settings with fallbacks
  const seoTitle = await getSetting('seo_title') || 'Garrit & Wulf - Premium Auto Parts';
  const seoDescription = await getSetting('seo_description') || 'Quality European, American Vehicle & Truck Parts - Transform Your Drive with Superior Parts. Precision manufacturing and exceptional customer service.';
  const seoKeywords = await getSetting('seo_keywords') || 'auto parts, European car parts, American vehicle parts, truck parts, premium auto parts, Garrit & Wulf, automotive parts, car accessories';
  const seoOgImage = await getSetting('seo_og_image') || '/images/og-image.jpg';
  const siteName = await getSetting('site_name') || 'Garrit & Wulf';

  // Fetch favicon settings
  const faviconIco = await getSetting('favicon_ico');
  const favicon16 = await getSetting('favicon_16');
  const favicon32 = await getSetting('favicon_32');
  const favicon192 = await getSetting('favicon_192');
  const appleTouchIcon = await getSetting('apple_touch_icon');

  // Build icons array
  const icons: Metadata['icons'] = [];
  
  if (faviconIco) {
    icons.push({ rel: 'icon', url: faviconIco });
  }
  
  if (favicon16) {
    icons.push({ rel: 'icon', type: 'image/png', sizes: '16x16', url: favicon16 });
  }
  
  if (favicon32) {
    icons.push({ rel: 'icon', type: 'image/png', sizes: '32x32', url: favicon32 });
  }
  
  if (favicon192) {
    icons.push({ rel: 'icon', type: 'image/png', sizes: '192x192', url: favicon192 });
  }
  
  if (appleTouchIcon) {
    icons.push({ rel: 'apple-touch-icon', sizes: '180x180', url: appleTouchIcon });
  }

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
    title: {
      default: seoTitle,
      template: `%s | ${siteName}`
    },
    description: seoDescription,
    keywords: seoKeywords.split(',').map((k: string) => k.trim()),
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    icons: icons.length > 0 ? icons : undefined, // Add favicons
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: "https://garritwulf.com",
      siteName: siteName,
      title: seoTitle,
      description: seoDescription,
      images: [
        {
          url: seoOgImage,
          width: 1200,
          height: 630,
          alt: seoTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
      images: [seoOgImage],
      creator: "@garritwulf",
    },
    alternates: {
      canonical: "https://garritwulf.com",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch analytics IDs from settings
  const googleAnalyticsId = await getSetting('google_analytics_id');
  const googleTagManagerId = await getSetting('google_tag_manager_id');

  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${oswald.variable} ${aclonica.variable} antialiased`}
        >
          {/* Google Analytics (GA4) */}
          {googleAnalyticsId && <GoogleAnalytics gaId={googleAnalyticsId} />}
          
          {/* Google Tag Manager */}
          {googleTagManagerId && <GoogleTagManager gtmId={googleTagManagerId} />}

          {/* Web Vitals Performance Monitoring */}
          <WebVitals />

          {/* <SplashCursor /> */}
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

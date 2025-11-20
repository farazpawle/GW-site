import type { Metadata } from "next";
import { Geist, Geist_Mono, Oswald, Aclonica } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import {
  getSetting,
  getMediaSettingUrl,
} from "@/lib/settings/settings-manager";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import GoogleTagManager from "@/components/analytics/GoogleTagManager";
import WebVitals from "@/components/analytics/WebVitals";
import { initializeApplication } from "@/lib/initialization";
import BackToTopButton from "@/components/BackToTopButton";
import "@/lib/env"; // Validate environment variables at startup
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "arial"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  fallback: ["monospace"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  display: "swap",
  fallback: ["sans-serif"],
});

const aclonica = Aclonica({
  variable: "--font-aclonica",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  fallback: ["cursive"],
});

/**
 * Generate dynamic metadata from settings
 * Falls back to hardcoded defaults if settings not found
 *
 * Note: During build (CI=true or NEXT_PHASE=phase-production-build),
 * database access is skipped and defaults are used.
 */
export async function generateMetadata(): Promise<Metadata> {
  // Skip database queries during build phase
  const isBuildTime =
    process.env.CI === "true" ||
    process.env.NEXT_PHASE === "phase-production-build";

  // Fetch SEO settings with fallbacks (skip DB during build)
  const seoTitle = isBuildTime
    ? "Garrit & Wulf - Premium Auto Parts"
    : (await getSetting("seo_title")) || "Garrit & Wulf - Premium Auto Parts";
  const seoDescription = isBuildTime
    ? "Quality European, American Vehicle & Truck Parts - Transform Your Drive with Superior Parts. Precision manufacturing and exceptional customer service."
    : (await getSetting("seo_description")) ||
      "Quality European, American Vehicle & Truck Parts - Transform Your Drive with Superior Parts. Precision manufacturing and exceptional customer service.";
  const seoKeywords = isBuildTime
    ? "auto parts, European car parts, American vehicle parts, truck parts, premium auto parts, Garrit & Wulf, automotive parts, car accessories"
    : (await getSetting("seo_keywords")) ||
      "auto parts, European car parts, American vehicle parts, truck parts, premium auto parts, Garrit & Wulf, automotive parts, car accessories";
  const seoOgImage = isBuildTime
    ? "/images/og-image.jpg"
    : (await getSetting("seo_og_image")) || "/images/og-image.jpg";
  const siteName = isBuildTime
    ? "Garrit & Wulf"
    : (await getSetting("site_name")) || "Garrit & Wulf";

  // Fetch favicon settings - use getMediaSettingUrl to get proper URLs (skip during build)
  const faviconIco = isBuildTime
    ? null
    : await getMediaSettingUrl("favicon_ico");
  const favicon16 = isBuildTime ? null : await getMediaSettingUrl("favicon_16");
  const favicon32 = isBuildTime ? null : await getMediaSettingUrl("favicon_32");

  // Build icons array
  const icons: Metadata["icons"] = [];

  if (faviconIco) {
    icons.push({ rel: "icon", url: faviconIco });
  }

  if (favicon16) {
    icons.push({
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      url: favicon16,
    });
  }

  if (favicon32) {
    icons.push({
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      url: favicon32,
    });
  }

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    ),
    title: {
      default: seoTitle,
      template: `%s | ${siteName}`,
    },
    description: seoDescription,
    keywords: seoKeywords.split(",").map((k: string) => k.trim()),
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
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
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
  // Skip runtime initialization and database queries during build
  const isBuildTime =
    process.env.CI === "true" ||
    process.env.NEXT_PHASE === "phase-production-build";

  // Initialize application (MinIO bucket, essential data)
  // This runs once on app startup and is idempotent
  if (!isBuildTime) {
    try {
      await initializeApplication();
    } catch (error) {
      console.error("⚠️  Initialization failed, but app will continue:", error);
    }
  }

  // Fetch analytics IDs from settings (skip during build)
  const googleAnalyticsId = isBuildTime
    ? null
    : await getSetting("google_analytics_id");
  const googleTagManagerId = isBuildTime
    ? null
    : await getSetting("google_tag_manager_id");

  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${oswald.variable} ${aclonica.variable} antialiased`}
        >
          {/* Google Analytics (GA4) */}
          {googleAnalyticsId && <GoogleAnalytics gaId={googleAnalyticsId} />}

          {/* Google Tag Manager */}
          {googleTagManagerId && (
            <GoogleTagManager gtmId={googleTagManagerId} />
          )}

          {/* Web Vitals Performance Monitoring */}
          <WebVitals />

          {/* <SplashCursor /> */}
          {children}
          <BackToTopButton />
        </body>
      </html>
    </ClerkProvider>
  );
}

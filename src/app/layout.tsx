import type { Metadata } from "next";
import { Geist, Geist_Mono, Oswald, Aclonica } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { getSetting } from "@/lib/settings/settings-manager";
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
  const googleAnalyticsId = await getSetting('google_analytics_id');
  const siteName = await getSetting('site_name') || 'Garrit & Wulf';

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
    verification: googleAnalyticsId ? {
      google: googleAnalyticsId,
    } : undefined,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${oswald.variable} ${aclonica.variable} antialiased`}
        >
          {/* <SplashCursor /> */}
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

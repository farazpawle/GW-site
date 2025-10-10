import type { Metadata } from "next";
import { Geist, Geist_Mono, Oswald, Aclonica } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
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

export const metadata: Metadata = {
  title: {
    default: "Garrit & Wulf - Premium Auto Parts",
    template: "%s | Garrit & Wulf"
  },
  description: "Quality European, American Vehicle & Truck Parts - Transform Your Drive with Superior Parts. Precision manufacturing and exceptional customer service.",
  keywords: ["auto parts", "European car parts", "American vehicle parts", "truck parts", "premium auto parts", "Garrit & Wulf", "automotive parts", "car accessories"],
  authors: [{ name: "Garrit & Wulf" }],
  creator: "Garrit & Wulf",
  publisher: "Garrit & Wulf",
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
    siteName: "Garrit & Wulf",
    title: "Garrit & Wulf - Premium Auto Parts",
    description: "Quality European, American Vehicle & Truck Parts - Transform Your Drive with Superior Parts",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Garrit & Wulf Premium Auto Parts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Garrit & Wulf - Premium Auto Parts",
    description: "Quality European, American Vehicle & Truck Parts - Transform Your Drive with Superior Parts",
    images: ["/images/twitter-image.jpg"],
    creator: "@garritwulf",
  },
  alternates: {
    canonical: "https://garritwulf.com",
  },
  verification: {
    google: "google-site-verification-code",
  },
};

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

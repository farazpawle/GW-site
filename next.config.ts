import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://challenges.cloudflare.com https://www.googletagmanager.com https://www.google-analytics.com https://*.clerk.accounts.dev https://clerk.garritwulf.com https://*.clerk.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https: http://localhost:9000 http://minio:9000 https://img.clerk.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://*.clerk.accounts.dev https://clerk.garritwulf.com https://api.clerk.com https://*.clerk.com wss://*.clerk.accounts.dev wss://clerk.garritwulf.com http://localhost:9000 http://minio:9000",
      "frame-src 'self' https://challenges.cloudflare.com https://www.google.com https://*.clerk.accounts.dev https://clerk.garritwulf.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; ')
  }
];

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'minio',
        port: '9000',
        pathname: '/**',
      },
    ],
    // Allow MinIO presigned URLs with query parameters
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  },
  serverExternalPackages: ['@prisma/client', 'prisma'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/parts',
        destination: '/products',
        permanent: true,
      },
      {
        source: '/parts/:path*',
        destination: '/products/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

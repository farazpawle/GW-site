import type { NextConfig } from "next";

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
    ],
  },
  serverExternalPackages: ['@prisma/client', 'prisma'],
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

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enables React 19's strict mode for better performance/debugging
  reactStrictMode: true,

  // Configures the BFF Rewrite logic
  async rewrites() {
    return [
      {
        // Any request sent to /api/proxy/xyz is forwarded to your Backend
        source: "/api/proxy/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/:path*`,
      },
    ];
  },

  // Image optimization (for NIRA National ID uploads/Vendor avatars)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com', // If using S3 for document storage
      },
    ],
  },
  
  // Experimental features for Next.js 16/React 19
  experimental: {
    taint: true, // Enables the security tainting used in auth.service.ts
  },
};

export default nextConfig;
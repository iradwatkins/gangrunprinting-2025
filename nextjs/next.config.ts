import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for self-hosting
  output: 'standalone',
  
  // Enable server actions
  experimental: {
    serverActions: {
      enabled: true,
    },
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'gangrunprinting.com',
        port: '',
        pathname: '/uploads/**',
      },
    ],
  },

  // Proxy API calls to Vite during migration
  async rewrites() {
    return {
      beforeFiles: [
        // Routes handled by Next.js
        { source: '/', destination: '/' },
        { source: '/products', destination: '/products' },
        { source: '/products/:slug', destination: '/products/:slug' },
      ],
      afterFiles: [
        // Fallback to Vite for unmigrated routes
        {
          source: '/api/legacy/:path*',
          destination: 'http://localhost:5173/api/:path*',
        },
        {
          source: '/checkout/:path*',
          destination: 'http://localhost:5173/checkout/:path*',
        },
        {
          source: '/admin/:path*',
          destination: 'http://localhost:5173/admin/:path*',
        },
      ],
    };
  },

  // Environment variables
  env: {
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/gangrunprinting',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3001',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
};

export default nextConfig;

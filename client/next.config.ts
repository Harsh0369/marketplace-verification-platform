import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Only proxy to Azure in production (Vercel).
    // In local development, it will continue to hit your local backend.
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://98.70.58.253/api/:path*'
        }
      ]
    }
    return []
  }
};

export default nextConfig;

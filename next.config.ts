import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow images from common bank logo CDNs
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.plaid.com' },
      { protocol: 'https', hostname: 'logo.clearbit.com' },
    ],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: '/wplace-status',
  assetPrefix: '/wplace-status/'
};

export default nextConfig;

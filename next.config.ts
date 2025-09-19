import type { NextConfig } from "next";

const nextConfig: NextConfig = {
images: {
    remotePatterns: [{ hostname: '**' }], // Allow external images for app icon gen
  },
  experimental: {
    serverActions: { bodySizeLimit: '10mb' }, 
    serverComponentsExternalPackages: ['pdf-parse'],// For file uploads
  },
};

export default nextConfig;

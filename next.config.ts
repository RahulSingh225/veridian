import type { NextConfig } from "next";

const nextConfig: NextConfig = {
images: {
    remotePatterns: [{ hostname: '**' }], // Allow external images for app icon gen
  },
  experimental: {
    serverActions: { bodySizeLimit: '10mb' }, 
    serverComponentsExternalPackages: ['pdf-parse','sharp'],// For file uploads
  },
  async headers() {
    return [
      { source: '/:path*', headers: [{ key: 'X-Frame-Options', value: 'DENY' }] },  // Example; add CSP, etc.
    ];
  },
};

export default nextConfig;

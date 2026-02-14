import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: 'dist',

  // Keep unoptimized images for simpler local/static asset handling.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

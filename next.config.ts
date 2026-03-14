import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  distDir: "dist",

  turbopack: {
    root: projectRoot,
  },
  allowedDevOrigins: ["10.100.110.115"],

  // Keep unoptimized images for simpler local/static asset handling.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

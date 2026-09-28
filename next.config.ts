import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Locally-generated placeholder SVGs for /work project cards — safe,
    // no external sources, no scripts.
    dangerouslyAllowSVG: true,
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;

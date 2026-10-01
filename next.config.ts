import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Locally-generated placeholder SVGs for /work project cards — safe,
    // no external sources, no scripts.
    dangerouslyAllowSVG: true,
    remotePatterns: [
      // Blog post cover images uploaded via Vercel Blob (scripts/setup-blog-db.mjs
      // and the admin upload flow both store them here). Wildcarded subdomain
      // since each Blob store gets its own random hostname prefix.
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  // Pin the workspace root explicitly so Turbopack doesn't misdetect it when
  // multiple lockfiles exist in the directory tree (e.g. a nested git
  // worktree); __dirname makes this a no-op on a normal checkout.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;

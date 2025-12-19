import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Force the project root to this folder for consistent
    // lockfile discovery and monorepo-style layouts.
    root: __dirname,
  },
};

export default nextConfig;

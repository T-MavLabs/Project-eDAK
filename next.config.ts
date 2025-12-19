import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Ensures Next uses this project directory as the root,
    // even if other lockfiles exist elsewhere on the machine.
    root: __dirname,
  },
};

export default nextConfig;

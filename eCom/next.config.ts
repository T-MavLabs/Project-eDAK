import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Force the project root to this folder so Turbopack
    // doesn't pick an external directory (and fail to lock).
    root: __dirname,
  },
  images: {
    remotePatterns: [
      // Supabase Storage public URLs:
      // https://<project-ref>.supabase.co/storage/v1/object/public/product-images/<path>
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
};

export default nextConfig;

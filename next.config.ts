import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbopack: !process.env.VERCEL, // Disable turbopack on Vercel temporarily
  },
};

export default nextConfig;

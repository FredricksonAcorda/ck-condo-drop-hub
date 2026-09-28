import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['*.trycloudflare.com'],
  experimental: {
    cpus: 2,
  },
};

export default nextConfig;

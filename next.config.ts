import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Vercel يدير الoutput تلقائياً - لا نحتاج standalone */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;

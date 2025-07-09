import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['@tanstack/react-query'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  workboxOptions: {
    disableDevLogs: true,
  },
  disable: process.env.NODE_ENV === "development",
});

export default pwaConfig(nextConfig);

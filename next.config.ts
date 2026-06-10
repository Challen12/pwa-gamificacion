import type { NextConfig } from "next";

// @ts-expect-error next-pwa doesn't have official types for Next 15+ yet
import withPWA from "next-pwa";

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  turbopack: {},
};

export default pwaConfig(nextConfig);

import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
  transpilePackages: ["@repo/ui", "@repo/schemas", "@repo/sdk"],
};

export default config;

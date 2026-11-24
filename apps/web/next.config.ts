import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@mirai/db"],
  experimental: {
    serverActions: {
      bodySizeLimit: "7mb",
    },
  },
};

export default nextConfig;

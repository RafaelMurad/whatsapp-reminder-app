import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [],
  transpilePackages: ["@repo/api", "@repo/db"],
};

export default nextConfig;

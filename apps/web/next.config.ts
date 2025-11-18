import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  serverExternalPackages: [],
  transpilePackages: ["@repo/api", "@repo/db"],
  outputFileTracingRoot: path.join(__dirname, "../../"),
};

export default nextConfig;

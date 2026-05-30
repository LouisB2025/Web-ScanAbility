import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['playwright-core', 'chrome-aws-lambda'],
};

export default nextConfig;

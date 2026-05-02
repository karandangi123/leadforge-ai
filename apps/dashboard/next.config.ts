import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@leadforge/agents", "@leadforge/db", "@leadforge/evals", "@leadforge/integrations", "@leadforge/crawler", "@leadforge/billing"],
  serverExternalPackages: ["playwright-core"],
};

export default nextConfig;

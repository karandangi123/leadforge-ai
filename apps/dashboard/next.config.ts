import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@leadforge/agents", "@leadforge/db", "@leadforge/evals", "@leadforge/integrations"],
};

export default nextConfig;

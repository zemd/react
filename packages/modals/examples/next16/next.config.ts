import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    // TypeScript 7 dropped the compiler API Next.js links against; drive `tsc` instead.
    useTypeScriptCli: true,
  },
  turbopack: {
    root: path.join(import.meta.dirname, "../../../.."),
  },
};

export default nextConfig;

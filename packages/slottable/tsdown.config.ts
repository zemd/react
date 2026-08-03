import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  sourcemap: false,
  clean: true,
  dts: true,
  format: ["cjs", "esm"],
  banner: '"use client";',
  deps: {
    onlyBundle: [],
    neverBundle: ["react"],
  },
  target: "es2020",
});

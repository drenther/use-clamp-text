import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  treeshake: true,
  target: "es2022",
  platform: "neutral",
  outputOptions: (options, format) =>
    format === "cjs" ? { ...options, exports: "named" } : options,
  deps: {
    neverBundle: ["react", "react-dom"],
  },
});

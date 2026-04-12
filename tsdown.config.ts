import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: {
    esm: {},
    cjs: {
      dts: false,
    },
  },
  dts: true,
  fixedExtension: false,
  sourcemap: true,
  clean: true,
});

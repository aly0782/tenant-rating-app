import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  // Use correct base path when deploying to GitHub Pages (set GH_PAGES=1 in env)
  base: process.env.GH_PAGES ? "/blueprint-scaffold/" : "/",
  define: {
    global: "globalThis",
  },
});

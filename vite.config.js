import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills({ protocolImports: true }), // polyfills node builtins
  ],
  resolve: {
    alias: {
      buffer: "buffer",
    },
  },
  define: {
    global: "window",
  },
  optimizeDeps: {
    include: ["buffer"], // makes sure buffer is bundled
  },
});



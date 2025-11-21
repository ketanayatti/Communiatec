import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.svg",
        "favicon.ico",
        "robots.txt",
        "apple-touch-icon.png",
      ],
      workbox: {
        // Raise precache limit to stop the build error
        maximumFileSizeToCacheInBytes: 8_000_000, // ~8 MB
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
      },
      manifest: {
        name: "Communiatec",
        short_name: "Communiatec",
        description: "Real-time collaborative chat and code pairing",
        theme_color: "#0f172a",
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
    dedupe: [
      "react",
      "react-dom",
      "@radix-ui/react-slot",
      "@radix-ui/react-primitive",
    ],
  },
  build: {
    // Never show the large chunk warning again
    chunkSizeWarningLimit: 10000, // 10 MB [web:42][web:21]
    commonjsOptions: {
      include: [/node_modules/],
    },
    rollupOptions: {
      output: {
        // Eager splitting by top-level package (no dynamic imports)
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("monaco-editor")) return "vendor_monaco";
            if (id.includes("@mui") || id.includes("@material-ui"))
              return "vendor_mui";
            if (id.includes("react-router")) return "vendor_react_router";
            if (id.includes("chart.js") || id.includes("@tanstack"))
              return "vendor_charts";
            if (id.includes("@radix-ui")) return "vendor_radix";
            const pkg = id.split("node_modules/")[1];
            return pkg ? pkg.split("/")[0] : "vendor";
          }
        },
      },
    },
  },
  optimizeDeps: {
    force: true,
    include: ["react", "react-dom", "react/jsx-runtime"],
    exclude: [],
  },
});

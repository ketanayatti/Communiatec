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
    chunkSizeWarningLimit: 1600,
    sourcemap: false, // Disable sourcemaps for production to save memory/time
    target: "es2015", // Modern browsers
    commonjsOptions: {
      include: [/node_modules/],
    },
    rollupOptions: {
      output: {
        // Optimized chunk splitting
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // 1. Monaco Editor (Huge)
            if (id.includes("monaco-editor") || id.includes("@monaco-editor")) {
              return "vendor_monaco";
            }
            // 2. 3D / Visualization
            if (
              id.includes("three") ||
              id.includes("@react-three") ||
              id.includes("vanta")
            ) {
              return "vendor_three";
            }
            // 3. React Ecosystem (Core)
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router") ||
              id.includes("zustand") ||
              id.includes("prop-types")
            ) {
              return "vendor_react";
            }
            // 4. UI Components & Icons
            if (
              id.includes("@radix-ui") ||
              id.includes("lucide-react") ||
              id.includes("react-icons") ||
              id.includes("@heroicons") ||
              id.includes("framer-motion") ||
              id.includes("clsx") ||
              id.includes("tailwind-merge")
            ) {
              return "vendor_ui";
            }
            // 5. Utilities
            if (
              id.includes("axios") ||
              id.includes("date-fns") ||
              id.includes("moment") ||
              id.includes("socket.io-client") ||
              id.includes("uuid")
            ) {
              return "vendor_utils";
            }

            // Default vendor chunk for everything else
            return "vendor_libs";
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

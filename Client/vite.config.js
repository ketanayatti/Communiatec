import path from "path";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
        maximumFileSizeToCacheInBytes: 8_000_000,
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
    alias: {
      "@": path.resolve(__dirname, "./src"),
      react: path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
    dedupe: [
      "react",
      "react-dom",
      "@radix-ui/react-slot",
      "@radix-ui/react-primitive",
      "sonner",
      "use-sync-external-store", // ✅ ADDED: Fix React external store duplicate
      "zustand", // ✅ ADDED: Prevent zustand duplication
    ],
  },
  build: {
    chunkSizeWarningLimit: 1600,
    sourcemap: true,
    target: "es2015",
    commonjsOptions: {
      include: [/node_modules/],
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // ✅ FIXED: Added sonner to React+UI chunk
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router") ||
              id.includes("zustand") ||
              id.includes("use-sync-external-store") || // ✅ ADDED
              id.includes("prop-types") ||
              id.includes("@radix-ui") ||
              id.includes("lucide-react") ||
              id.includes("react-icons") ||
              id.includes("@heroicons") ||
              id.includes("framer-motion") ||
              id.includes("clsx") ||
              id.includes("tailwind-merge") ||
              id.includes("socket.io-client") ||
              id.includes("sonner") || // ✅ ADDED: Bundle sonner with React deps
              id.includes("axios") ||
              id.includes("date-fns") ||
              id.includes("moment") ||
              id.includes("uuid")
            ) {
              return "vendor_react";
            }

            // Isolated heavy deps
            if (id.includes("monaco-editor") || id.includes("@monaco-editor")) {
              return "vendor_monaco";
            }
            if (
              id.includes("three") ||
              id.includes("@react-three") ||
              id.includes("vanta")
            ) {
              return "vendor_three";
            }

            return "vendor_libs";
          }
        },
      },
    },
  },
  optimizeDeps: {
    force: true,
    include: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "socket.io-client",
      "sonner",
      "use-sync-external-store", // ✅ ADDED: Pre-bundle to prevent duplication
      "zustand", // ✅ ADDED: Pre-bundle state manager
    ],
  },
});

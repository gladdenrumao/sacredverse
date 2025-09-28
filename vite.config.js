import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate", // automatically update SW when new deploy
      includeAssets: ["favicon.svg", "robots.txt", "icons/*.svg"],
      manifest: {
        name: "SacredVerse",
        short_name: "SacredVerse",
        description: "One simple verse + one good deed — daily.",
        theme_color: "#2fa66a",
        background_color: "#fbfcfb",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
          { src: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml", purpose: "any maskable" }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            // cache content.json aggressively but update in background
            urlPattern: /\/content\.json$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "content-json-cache",
              expiration: { maxEntries: 2, maxAgeSeconds: 60 * 60 * 24 * 7 } // one week
            }
          },
          {
            // index.html and app shell prefer network but fallback to cache
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "html-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 7 }
            }
          },
          {
            // static assets: JS/CSS/images
            urlPattern: /\.(?:js|css|png|jpg|jpeg|svg|webp)$/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "assets-cache",
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          }
        ]
      }
    })
  ]
});

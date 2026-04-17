import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

const DEFAULT_PORT = Number(process.env.VITE_PORT ?? process.env.PORT ?? 5173);
const DEFAULT_HOST = process.env.VITE_HOST ?? "0.0.0.0";
const HMR_HOST = DEFAULT_HOST;

export default defineConfig(({ mode }) => ({
  server: {
    host: DEFAULT_HOST,
    port: DEFAULT_PORT,
    strictPort: false,
    hmr: {
      overlay: false,
      host: HMR_HOST,
      port: DEFAULT_PORT,
      clientPort: DEFAULT_PORT,
    },
    watch: {
      usePolling: false,
      ignored: ["**/node_modules/**", "**/.git/**", "**/dist/**"],
    },
    fs: {
      strict: false,
      allow: [".."],
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    mode === "production" && VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png"],
      manifest: {
        id: "/",
        name: "HomieAI - Smart Roommate & Co-Buying Platform",
        short_name: "HomieAI",
        description: "Find your perfect roommate or co-buy investment partner in Canada. AI-powered matching for renters, landlords, and property investors.",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait-primary",
        scope: "/",
        start_url: "/",
        lang: "en-CA",
        screenshots: [
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            form_factor: "narrow"
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            form_factor: "wide"
          }
        ],
        icons: [
          {
            src: "/icons/icon-72x72.png",
            sizes: "72x72",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/icons/icon-96x96.png",
            sizes: "96x96",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/icons/icon-128x128.png",
            sizes: "128x128",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/icons/icon-144x144.png",
            sizes: "144x144",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/icons/icon-152x152.png",
            sizes: "152x152",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: "/icons/icon-384x384.png",
            sizes: "384x384",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          }
        ],
        shortcuts: [
          {
            name: "Find Property",
            short_name: "Find",
            description: "Search for properties",
            url: "/find-property",
            icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" }]
          },
          {
            name: "My Matches",
            short_name: "Matches",
            description: "View your matches",
            url: "/dashboard/matches",
            icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" }]
          },
          {
            name: "Messages",
            short_name: "Messages",
            description: "View your messages",
            url: "/dashboard/chats",
            icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" }]
          },
          {
            name: "Add Property",
            short_name: "Add",
            description: "List a new property",
            url: "/landlord/add-property",
            icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" }]
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10 MB
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.googleapis\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.stripe\.com\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "stripe-cache",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 // 1 hour
              }
            }
          }
        ]
      }
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ['pdfjs-dist'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          supabase: ['@supabase/supabase-js'],
          stripe: ['@stripe/react-stripe-js', '@stripe/stripe-js'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  },
}));

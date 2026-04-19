import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

const DEFAULT_PORT = Number(process.env.VITE_PORT ?? process.env.PORT ?? 5173);
const DEFAULT_HOST = process.env.VITE_HOST ?? "0.0.0.0";

export default defineConfig(({ mode }) => ({
  server: {
    host: DEFAULT_HOST,
    port: DEFAULT_PORT,
    strictPort: false,
    hmr: {
      overlay: false
    },
    watch: {
      usePolling: false,
      ignored: ["**/node_modules/**", "**/.git/**"]
    },
    plugins: [
      react(),
      componentTagger()
    ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: {
            manualChunks: {
              react: React,
              "react-dom": "react-dom",
              "react-router-dom": "react-router-dom"
            }
          }
        }
      }
    }
  },
  optimizeDeps: {
    include: ["react", "react-dom"]
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  }
});

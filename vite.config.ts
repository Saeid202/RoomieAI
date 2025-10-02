import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: '0.0.0.0',
    port: 8080,
    strictPort: true,
    hmr: {
      host: 'localhost',
      clientPort: 8080,
      protocol: 'ws',
      overlay: false,
    },
    watch: {
      usePolling: true,
      // Ignore certain file patterns
      ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**'],
      // Reduce auto-reload frequency
      interval: 1000,
    },
    fs: {
      strict: true,
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

const DEFAULT_PORT = Number(process.env.VITE_PORT ?? process.env.PORT ?? 5173);
const DEFAULT_HOST = process.env.VITE_HOST ?? "0.0.0.0";
const HMR_HOST = DEFAULT_HOST === "0.0.0.0" ? "127.0.0.1" : DEFAULT_HOST;

export default defineConfig(({ mode }) => ({
  server: {
    host: DEFAULT_HOST,
    port: DEFAULT_PORT,
    strictPort: false,
    hmr: {
      host: HMR_HOST,
      protocol: "ws",
      overlay: false,
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
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
}));

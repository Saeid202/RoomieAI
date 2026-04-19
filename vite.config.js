import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
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
        }
    },
    plugins: [
        react()
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src")
        }
    },
    optimizeDeps: {
        include: ["react", "react-dom"]
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    react: ["react", "react-dom"],
                    router: ["react-router-dom"],
                    ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"],
                    supabase: ["@supabase/supabase-js"],
                    stripe: ["@stripe/react-stripe-js", "@stripe/stripe-js"]
                }
            }
        },
        chunkSizeWarningLimit: 1000
    }
}));

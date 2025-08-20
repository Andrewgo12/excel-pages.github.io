import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server/index.js";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // GitHub Pages configuration - User site (andrewgo12.github.io)
  base: mode === 'production' ? '/' : '/',
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    // Ensure proper asset handling for GitHub Pages
    rollupOptions: {
      output: {
        manualChunks: undefined,
        // Ensure assets have proper paths for GitHub Pages
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
    // Optimize for production
    sourcemap: false,
    minify: 'esbuild',
    // Ensure compatibility with GitHub Pages
    target: 'es2015',
    cssCodeSplit: true,
    // Optimize chunk size for better loading
    chunkSizeWarningLimit: 1000,
  },
  plugins: [react(), ...(mode === 'development' ? [expressPlugin()] : [])],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./client"),
      "@shared": path.resolve(process.cwd(), "./shared"),
    },
  },
  // Ensure proper MIME types for GitHub Pages
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
}));

function expressPlugin() {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      const app = createServer();

      // Add Express app as middleware to Vite dev server
      server.middlewares.use(app);
    },
  };
}

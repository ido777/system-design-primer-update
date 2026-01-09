import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import Checker from "vite-plugin-checker";
import viteTsconfigPaths from "vite-tsconfig-paths";
import { visualizer } from "rollup-plugin-visualizer";


export default defineConfig(({ command, mode }) => {
  // Allow base to be overridden via CLI --base flag or VITE_BASE env var
  // Default to "/" for local development
  // Note: CLI --base flag takes precedence over this config
  const base = process.env.VITE_BASE || "/";
  
  return {
    // base will be overridden by --base CLI flag if provided
    base,
    css: {
      modules: {},
    },
    define: {
      ENABLE_FIREBASE:
        process.env.ENABLE_FIREBASE ||
        true,
      PUBLIC_URL: JSON.stringify(
        process.env.PUBLIC_URL || base,
      ),
    },
  resolve: {
    alias: {
      "@": path.resolve(
        __dirname,
        "src",
      ),
    },
  },
  plugins: [
    react(),
    viteTsconfigPaths(),
    Checker({ typescript: true }),
    visualizer({ open: true, gzipSize: true, brotliSize: true }),
  ],
  clearScreen: false,
  server: {
    strictPort: true,
  },
  envPrefix: [
    "VITE_",
    "TAURI_PLATFORM",
    "TAURI_ARCH",
    "TAURI_FAMILY",
    "TAURI_PLATFORM_VERSION",
    "TAURI_PLATFORM_TYPE",
    "TAURI_DEBUG",
  ],
  build: {
    outDir: "dist",
    // Tauri uses Chromium on Windows and WebKit on macOS and Linux
    target:
      process.env.TAURI_PLATFORM ===
      "windows"
        ? "chrome105"
        : "safari13",
    // don't minify for debug builds
    minify: !process.env.TAURI_DEBUG
      ? "esbuild"
      : false,
    // produce sourcemaps for debug builds
    sourcemap:
      !!process.env.TAURI_DEBUG,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split vendor libraries into separate chunks by domain
          if (id.includes("node_modules")) {
            // React and React DOM - core framework
            if (id.includes("react") || id.includes("react-dom")) {
              return "react-vendor";
            }
            
            // Mantine UI library - split charts separately
            if (id.includes("@mantine/charts") || id.includes("recharts")) {
              return "mantine-charts";
            }
            if (id.includes("@mantine")) {
              return "mantine";
            }
            
            // Editor stack - TipTap/ProseMirror
            if (
              id.includes("@tiptap") ||
              id.includes("prosemirror") ||
              id.includes("yjs") ||
              id.includes("y-prosemirror")
            ) {
              return "editor";
            }
            
            // Database stack - Dexie and related
            if (
              id.includes("dexie") ||
              id.includes("dexie-cloud")
            ) {
              return "database";
            }
            
            // RxJS (if used for collaboration/editor)
            if (id.includes("rxjs")) {
              return "rxjs";
            }
            
            // Router
            if (id.includes("react-router")) {
              return "router";
            }
            
            // Other large vendor libraries
            if (
              id.includes("@tabler") ||
              id.includes("fsrs") ||
              id.includes("i18next")
            ) {
              return "utils";
            }
            
            // All other node_modules
            return "vendor";
          }
          // Return undefined for non-node_modules files (they go in the main chunk)
          return undefined;
        },
        chunkSizeWarningLimit: 600,
      },
    },
  },
  };
});

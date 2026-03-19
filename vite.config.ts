import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
     allowedHosts: true, // ✅ add this
    headers: {
      "Content-Security-Policy":
        "default-src 'self' https:; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; " +
        "style-src 'self' 'unsafe-inline' https:; " +
        "img-src 'self' data: https:; " +
        "font-src 'self' https: data:; " +
        "connect-src 'self' https:;"
    }
  },

  plugins: [
    react(),
    mode === "development" && componentTagger()
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));


// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react-swc";
// import path from "path";
// import { componentTagger } from "lovable-tagger";

// // https://vitejs.dev/config/
// export default defineConfig(({ mode }) => ({
//   server: {
//     host: "::",
//     port: 8080,
//   },
//   plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },
//     // server.
//   },
// }));




// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react-swc";
// import path from "path";
// import { componentTagger } from "lovable-tagger";
// import { visualizer } from "rollup-plugin-visualizer";

// // https://vitejs.dev/config/
// export default defineConfig(({ mode }) => ({
//   server: {
//     host: "::",
//     port: 8080,
//   },
//   plugins: [
//     react(),
//     mode === "development" && componentTagger(),
//     // Bundle analyzer - generates stats.html after build
//     mode === "production" && visualizer({
//       filename: "./dist/stats.html",
//       open: false,
//       gzipSize: true,
//       brotliSize: true,
//     }),
//   ].filter(Boolean),
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },
//   },
//   build: {
//     // Optimize chunk splitting
//     rollupOptions: {
//       output: {
//         manualChunks: (id) => {
//           // Vendor chunks for better caching
//           if (id.includes("node_modules")) {
//             // React ecosystem
//             if (id.includes("react") || id.includes("react-dom") || id.includes("react-router")) {
//               return "react-vendor";
//             }
//             // Animation libraries
//             if (id.includes("framer-motion")) {
//               return "animation-vendor";
//             }
//             // UI libraries
//             if (id.includes("@radix-ui") || id.includes("lucide-react")) {
//               return "ui-vendor";
//             }
//             // Supabase
//             if (id.includes("supabase")) {
//               return "supabase-vendor";
//             }
//             // Query libraries
//             if (id.includes("@tanstack")) {
//               return "query-vendor";
//             }
//             // Other vendors
//             return "vendor";
//           }
          
//           // Split large page components
//           if (id.includes("/pages/Home")) {
//             return "home-page";
//           }
//         },
//         // Optimize asset file names for better caching
//         assetFileNames: (assetInfo) => {
//           // Fix TypeScript warnings - check if name exists
//           if (!assetInfo.names || assetInfo.names.length === 0) {
//             return `assets/[name]-[hash][extname]`;
//           }
          
//           const name = assetInfo.names[0];
//           const ext = name.split('.').pop() || '';
          
//           // Separate images, fonts, and other assets
//           if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
//             return `assets/images/[name]-[hash][extname]`;
//           }
//           if (/woff|woff2|ttf|otf/i.test(ext)) {
//             return `assets/fonts/[name]-[hash][extname]`;
//           }
//           return `assets/[name]-[hash][extname]`;
//         },
//         chunkFileNames: "assets/js/[name]-[hash].js",
//         entryFileNames: "assets/js/[name]-[hash].js",
//       },
//     },
//     // Increase chunk size warning limit (since you have animations/images)
//     chunkSizeWarningLimit: 1000,
//     // Production optimizations
//     minify: "terser",
//     terserOptions: {
//       compress: {
//         drop_console: true, // Remove console.logs in production
//         drop_debugger: true,
//         pure_funcs: ["console.log", "console.info"], // Remove specific console methods
//       },
//       format: {
//         comments: false, // Remove comments
//       },
//     },
//     // Source maps for debugging (disable in production if not needed)
//     sourcemap: mode === "development",
//     // Enable CSS code splitting
//     cssCodeSplit: true,
//     // Optimize assets
//     assetsInlineLimit: 4096, // Inline assets smaller than 4kb
//   },
//   // Optimize dependencies
//   optimizeDeps: {
//     include: [
//       "react",
//       "react-dom",
//       "react-router-dom",
//       "framer-motion",
//       "@tanstack/react-query",
//     ],
//     exclude: ["lovable-tagger"],
//   },
//   // Enable esbuild optimizations
//   esbuild: {
//     logOverride: { "this-is-undefined-in-esm": "silent" },
//     ...(mode === "production" && {
//       drop: ["console", "debugger"],
//     }),
//   },
// }));
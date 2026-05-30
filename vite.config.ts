import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig({
  plugins: [
    tanstackStart({
      server: { preset: 'node-server' },
    }),
    viteReact(),
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("@tanstack")) return "tanstack";
          if (id.includes("/react/") || id.includes("/react-dom/") || id.includes("/scheduler/"))
            return "react-core";
          if (id.includes("/three/")) return "three-core";
          if (
            id.includes("@react-three") ||
            id.includes("/three-stdlib/") ||
            id.includes("/meshline/")
          )
            return "three-addons";
          if (id.includes("/uplot/") || id.includes("/recharts/") || id.includes("/d3-"))
            return "charts";
          if (id.includes("/lucide-react/")) return "icons";
          if (id.includes("@radix-ui")) return "radix-ui";
          if (id.includes("@supabase")) return "supabase";
          if (id.includes("/mongodb/") || id.includes("/bson/")) return "mongodb";
          if (id.includes("/zod/")) return "zod";
          if (id.includes("/zustand/")) return "zustand";
          return "vendor";
        },
      },
    },
  },
});

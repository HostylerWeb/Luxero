import "@luxero/env/server";

import path from "node:path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import vike from "vike/plugin";
import { defineConfig } from "vite";

if ((process.env.FRAMEWORK || "").toLowerCase() !== "vike") {
  console.warn(`[vite] Expected FRAMEWORK=vike, got: ${process.env.FRAMEWORK}`);
}

export default defineConfig({
  plugins: [react(), tailwindcss(), vike()],
  server: {
    allowedHosts: ["debug.luxero.win"],
  },
  envPrefix: ["PUBLIC_ENV__", "VITE_"],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  ssr: {
    noExternal: [
      "@luxero/api-client",
      "@luxero/api-db",
      "@luxero/api-server",
      "@luxero/auth-client",
      "@luxero/icons",
      "@luxero/content",
      "@luxero/types",
      "@luxero/utils",
      "@luxero/auth-admin",
    ],
    external: [
      "react",
      "react-dom",
      "mongoose",
      "sharp",
      "fluent-ffmpeg",
      "web-push",
      "mongodb-memory-server",
    ],
  },
  build: {
    rollupOptions: {
      onwarn(warning, defaultHandler) {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
        if (
          warning.code === "SOURCEMAP_ERROR" &&
          warning.message.includes("resolve original location")
        )
          return;
        defaultHandler(warning);
      },
    },
  },
});

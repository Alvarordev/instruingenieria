import node from "@astrojs/node";
import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

const apiTarget = process.env.API_URL ?? "http://localhost:4000";

export default defineConfig({
  output: "server",
  // @astrojs/node only honors the HOST env var at runtime (not a build-time
  // option here) — set HOST=0.0.0.0 wherever this runs, see Dockerfile.web.
  // Required because Bun's node:http compat layer binds an unset host to
  // ::1 only (not all interfaces, unlike real Node's default).
  adapter: node({ mode: "standalone" }),
  integrations: [svelte()],
  vite: {
    plugins: [tailwindcss()],
    server: {
      proxy: {
        "/api": apiTarget,
        "/uploads": apiTarget,
      },
    },
  },
});

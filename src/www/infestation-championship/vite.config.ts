import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  cloudflare: false,
  vite: {
    define: {
      "process.platform": '"browser"',
      "process.env.NODE_ENV": '"production"',
    },
    server: {
      port: 8080,
    },
  },
});

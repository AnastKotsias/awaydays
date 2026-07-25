import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Keep in sync with "paths" in tsconfig.app.json.
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // Fail loudly instead of silently moving to 5174, which would break the
    // CORS_ORIGIN the API is configured to allow.
    strictPort: true,
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import eslint from "vite-plugin-eslint";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/Jobs/",
  build: {
    target: "es2022",
  },
  plugins: [
    react(),
    viteTsconfigPaths(),
    eslint({
      cache: false,
      failOnError: true,
      failOnWarning: false,
      include: ["src/**/*.ts", "src/**/*.tsx", "../**/*.ts", "../**/*.tsx"],
    }),
  ],
  server: {
    open: true,
    port: 3000,
  },
});

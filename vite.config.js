import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import eslint from "vite-plugin-eslint";
import checker from "vite-plugin-checker";

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
      failOnWarning: true,
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: [
        "src/**/*.test.ts",
        "src/**/*.test.tsx",
        "**dist/**",
        "**.d.ts",
      ],
    }),
    checker({ typescript: true }),
  ],
  server: {
    open: true,
    port: 3000,
  },
});

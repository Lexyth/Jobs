import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/Jobs/',
  build: {
    target: 'es2022',
  },
  plugins: [
    react(),
    viteTsconfigPaths(),
  ],
  server: {
    open: true,
    port: 3000
  }
})

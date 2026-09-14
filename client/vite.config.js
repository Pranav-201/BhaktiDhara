import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config. Service worker is provided as a hand-written file at
// public/service-worker.js and registered manually in main.jsx so we have
// full control over caching the app shell vs. the IndexedDB music library.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});

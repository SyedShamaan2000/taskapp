import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const bypassHtml = (req: import('http').IncomingMessage) => {
  if (req.headers.accept?.includes('text/html')) {
    return '/index.html';
  }
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/csrf-token': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        bypass: bypassHtml,
      },
      '/tasks': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        bypass: bypassHtml,
      },
      '/verify': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        bypass: bypassHtml,
      },
    },
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL || 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});

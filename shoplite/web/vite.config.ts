import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // The API runs on :4000 (npm run dev:api)
      '/api': 'http://localhost:4000',
    },
  },
  test: {
    environment: 'node',
  },
});

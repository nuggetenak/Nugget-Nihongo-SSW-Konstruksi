import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/Nugget-Nihongo-SSW-Konstruksi/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/src/data/cards.js')) return 'cards-data';
          if (id.includes('/node_modules/')) return 'vendor';
        },
      },
    },
  },
});

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
        manualChunks: {
          // React runtime — loads first, cached long-term
          'vendor-react': ['react', 'react-dom'],
          // FSRS engine — isolated, rarely changes
          'vendor-fsrs': ['ts-fsrs'],
          // Heavy data files — loaded in parallel with main chunk
          'data-cards': ['./src/data/cards.js'],
          'data-jac': ['./src/data/jac-official.js'],
          'data-wayground': ['./src/data/wayground-sets.js'],
          'data-csv': ['./src/data/csv-sets.js'],
          // SRS layer — shared across ReviewMode + FlashcardMode
          'srs-engine': [
            './src/srs/fsrs-core.js',
            './src/srs/fsrs-scheduler.js',
            './src/srs/fsrs-store.js',
          ],
        },
      },
    },
  },
});

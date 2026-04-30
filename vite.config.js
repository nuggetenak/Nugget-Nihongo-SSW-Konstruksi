import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // Bundle visualizer — generates stats.html on build (only in non-CI)
    mode !== 'test' && visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
      title: 'SSW Konstruksi — Bundle Analysis',
    }),
  ].filter(Boolean),
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
}));

// ─── vitest.config.js (phaseG) ────────────────────────────────────────────────
// G.1: Added coverage thresholds (70% lines/functions, 60% branches).
// ─────────────────────────────────────────────────────────────────────────────
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/utils/**',
        'src/srs/**',
        'src/hooks/**',
        'src/storage/**',
        'src/components/Dashboard.jsx',
        'src/components/QuizShell.jsx',
        'src/components/ResultScreen.jsx',
      ],
      exclude: ['src/tests/**', 'src/data/**'],
      // G.1: Coverage thresholds
      thresholds: {
        lines:     70,
        functions: 70,
        branches:  60,
      },
    },
  },
});

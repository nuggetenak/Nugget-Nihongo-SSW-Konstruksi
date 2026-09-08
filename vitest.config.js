// ─── vitest.config.js (phaseG) ────────────────────────────────────────────────
// G.1: Added coverage thresholds (70% lines/functions, 60% branches).
// FE-07-A: resolve alias '@' → src/ mirrors vite.config.js.
// `define` mirrors vite.config.js too: this is a standalone config, so nothing
// from the app build reaches it. SayaTab has printed __APP_VERSION__ in three
// places since 6.x and no test ever rendered SayaTab, so the missing define was
// invisible until one did -- at which point it is a ReferenceError, not a
// wrong string. Any define added there belongs here as well.
// ─────────────────────────────────────────────────────────────────────────────
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf8'));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
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
        lines: 70,
        functions: 70,
        branches: 60,
      },
    },
  },
});

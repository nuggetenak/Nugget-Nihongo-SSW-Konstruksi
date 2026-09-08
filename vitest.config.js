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
      // Item 135: this was an allowlist of seven safe places, and the numbers
      // it produced were about those seven places rather than about the app.
      // src/modes/** -- 10,632 lines, more than half the source, and where
      // every P0 in the 2026-09-04 exam audit lived -- was outside it, so a
      // mode could go from written to shipped without registering at all.
      // Measuring the whole of src/ is the only version of this number that
      // answers the question anyone asks it.
      include: ['src/**'],
      exclude: ['src/tests/**', 'src/data/**', 'src/main.jsx', '**/*.module.css'],
      // A ratchet, not an aspiration. Measured 2026-09-08 across the whole of
      // src/: 59.15 lines, 54.76 functions, 50.9 branches. Set a point below
      // each, because v8's branch figure moves by a few hundredths between runs
      // and a threshold that fails on noise gets deleted rather than met.
      // Raise them when coverage rises; never lower them to make a red run
      // green. The old 70/70/60 was neither a ratchet nor a target -- it was a
      // wish, enforced nowhere, because `test:coverage` was in no npm script
      // and no workflow. It is a CI step now, so these have teeth at last.
      thresholds: {
        lines: 58,
        functions: 54,
        branches: 50,
      },
    },
  },
});

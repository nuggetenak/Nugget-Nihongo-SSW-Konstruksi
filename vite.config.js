import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/Nugget-Nihongo-SSW-Konstruksi/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});

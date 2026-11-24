import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  base: '/spaceship-survival-3/',
  plugins: [react()],
  resolve: {
    alias: {
      'spaceship-survival-3': path.resolve(import.meta.dirname, 'src')
    }
  }
});

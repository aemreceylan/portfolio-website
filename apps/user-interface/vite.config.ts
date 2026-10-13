import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

import path from 'path';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', {}]],
      },
    }),
  ],
  resolve: {
    alias: {
      '#components': path.resolve(__dirname, './src/components'),
      '#stores': path.resolve(__dirname, './src/stores'),
      '#styles': path.resolve(__dirname, './src/styles'),
      '#apps': path.resolve(__dirname, './src/apps'),
      '#i18n': path.resolve(__dirname, './src/i18n'),
      '#test': path.resolve(__dirname, './src/test'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
  server: {
    port: 3000,
  },
});

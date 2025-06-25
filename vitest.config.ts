/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['src/**/*.stories.*', 'src/vite-env.d.ts'],
    },
    // 👇 Define 2 projects
    projects: [
      // ✅ UNIT TESTS
      {
        name: 'unit',
        test: {
          environment: 'jsdom',
          setupFiles: './vitest.setup.ts',
          include: ['src/**/*.test.ts?(x)'], // รันเฉพาะ unit tests
        },
      },

      // ✅ STORYBOOK TESTS
      {
        name: 'storybook',
        plugins: [
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
          }),
        ],
        test: {
          setupFiles: ['.storybook/vitest.setup.ts'],
          browser: {
            enabled: true,
            headless: true,
            provider: 'playwright',
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});

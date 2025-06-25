import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

    /* ---------- Projects ---------- */
    projects: [
      {
        extends: true, // reuse root options
        test: {
          name: 'unit', // <-- ต้องอยู่ใต้ test
          environment: 'jsdom',
          setupFiles: './vitest.setup.ts',
          include: ['src/**/*.test.ts?(x)'],
        },
      },
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
          }),
        ],
        test: {
          name: 'storybook',
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

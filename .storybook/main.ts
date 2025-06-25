// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const config: StorybookConfig = {
  /* ---------- 1. กำหนด glob สองแบบ ---------- */
  stories: [
    // ① MDX docs (ถ้ามี)
    '../src/**/*.mdx',
    // ② สตอรีที่อยู่ในโฟลเดอร์ __stories__
    '../src/**/__stories__/*.stories.@(ts|tsx)',
  ],

  /* ---------- 2. Addons ที่ CLI ติดตั้งให้แล้ว ---------- */
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-interactions',
    '@storybook/addon-vitest',
  ],

  /* ---------- 3. Framework & Docs ---------- */
  framework: '@storybook/react-vite',
  docs: { autodocs: 'tag' },

  /* ---------- 4. ปลั๊กอิน vite เพิ่ม path alias ---------- */
  viteFinal(config) {
    config.plugins = config.plugins || [];
    config.plugins.push(tsconfigPaths());
    return config;
  },

  /* ---------- 5. ใช้ tsconfig.storybook.json ---------- */
  typescript: {
    tsconfigPath: './tsconfig.storybook.json',
  },
};

export default config;

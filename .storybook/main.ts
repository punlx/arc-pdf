// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const config: StorybookConfig = {
  stories: ['../src/**/__stories__/*.stories.@(ts|tsx)'],

  addons: [
    '@storybook/addon-links',

    // 👇 ปิดเฉพาะ Toolbar (ฟีเจอร์อื่นของ essentials ยังใช้ได้)
    {
      name: '@storybook/addon-essentials',
      options: {ฟ
        toolbar: false, // <<< KEY LINE
      },
    },

    '@storybook/addon-a11y',
    '@storybook/addon-interactions',
    '@storybook/addon-vitest',
    '@storybook/addon-docs',
  ],

  framework: '@storybook/react-vite',
  docs: { autodocs: 'tag' },

  viteFinal(config) {
    config.plugins ??= [];
    config.plugins.push(tsconfigPaths());
    return config;
  },

  typescript: { tsconfigPath: './tsconfig.storybook.json' },
};

export default config;

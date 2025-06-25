// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const config: StorybookConfig = {
  stories: ['../src/**/__stories__/*.stories.@(ts|tsx)'],

  addons: [
    '@storybook/addon-links',

    // 👇 ปิด Toolbar อย่างถูก syntax
    {
      name: '@storybook/addon-essentials',
      options: {
        toolbar: false, // ← ต้องมี ":" และปิด "}," ให้ครบ
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

// .storybook/preview.ts
import type { Preview } from '@storybook/react';
import '../src/index.css'; // รวม Tailwind + shadcn/ui theme

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    viewport: {
      defaultViewport: 'responsive',
    },
  },
};

export default preview;

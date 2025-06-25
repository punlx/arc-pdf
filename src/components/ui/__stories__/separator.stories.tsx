// src/components/ui/__stories__/separator.stories.tsx
import type { Meta } from '@storybook/react';
import { Separator } from '../separator';

export default {
  title: 'UI/Separator',
  component: Separator,
  tags: ['autodocs'],
} satisfies Meta<typeof Separator>;

export const Horizontal = {
  render: () => <Separator className="my-4" />,
};

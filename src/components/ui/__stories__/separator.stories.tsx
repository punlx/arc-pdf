// src/components/ui/__stories__/separator.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Separator } from '../separator';
import { within, expect } from '@storybook/test';

export default {
  title: 'UI/Separator',
  component: Separator,
  tags: ['autodocs'],
} satisfies Meta<typeof Separator>;

export const Horizontal: StoryObj<typeof Separator> = {
  render: () => <Separator className="my-4" />,
  play: async ({ canvasElement }) => {
    const sep = within(canvasElement).getByRole('separator');
    expect(sep).toBeInTheDocument();
  },
};

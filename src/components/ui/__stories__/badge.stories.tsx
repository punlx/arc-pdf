// src/components/ui/__stories__/badge.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '../badge';

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'radio',
      options: ['default', 'secondary', 'destructive', 'outline'],
    },
    children: { control: 'text' },
  },
  args: { children: 'Badge' },
};
export default meta;
type Story = StoryObj<typeof Badge>;

export const Playground: Story = {};
export const Outline: Story = { args: { variant: 'outline' } };

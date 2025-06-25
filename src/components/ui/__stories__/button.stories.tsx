// src/components/ui/button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../button';

const meta: Meta<typeof Button> = {
  component: Button,
  title: 'UI/Button',
  tags: ['autodocs'], // ให้ addon-docs gen อัตโนมัติ
  argTypes: {
    variant: {
      control: 'radio',
      options: ['default', 'outline', 'destructive', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'radio',
      options: ['sm', 'default', 'lg', 'icon'],
    },
    children: { control: 'text' },
  },
  args: {
    variant: 'default',
    size: 'default',
    children: 'Button',
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Playground: Story = {};

export const Outline: Story = {
  args: { variant: 'outline' },
};

export const Destructive: Story = {
  args: { variant: 'destructive' },
};

// src/components/ui/__stories__/input.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '../input';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
  },
  args: { placeholder: 'Type something…' },
};
export default meta;
type Story = StoryObj<typeof Input>;

export const Playground: Story = {};
export const Disabled: Story = { args: { disabled: true, placeholder: 'Disabled' } };

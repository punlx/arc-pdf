// src/components/ui/__stories__/select.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../select';

const meta: Meta = {
  title: 'UI/Select',
  tags: ['autodocs'],
  render: (args) => (
    <Select {...args}>
      <SelectTrigger className="w-40">
        <SelectValue placeholder="Pick one" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="orange">Orange</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
      </SelectContent>
    </Select>
  ),
  argTypes: {
    disabled: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj;

export const Playground: Story = {};
export const Disabled: Story = { args: { disabled: true } };

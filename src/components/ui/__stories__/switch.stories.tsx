// src/components/ui/__stories__/switch.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from '../switch';

const meta: Meta<typeof Switch> = {
  title: 'UI/Switch',
  component: Switch,
  tags: ['autodocs'],
  argTypes: {
    defaultChecked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof Switch>;

export const Playground: Story = {};
export const DefaultOn: Story = { args: { defaultChecked: true } };
export const Disabled: Story = { args: { disabled: true } };

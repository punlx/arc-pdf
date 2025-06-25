// src/components/ui/__stories__/switch.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from '../switch';
import { userEvent, within, expect } from '@storybook/test';

const meta: Meta<typeof Switch> = {
  title: 'UI/Switch',
  component: Switch,
  tags: ['autodocs'],
  argTypes: { disabled: { control: 'boolean' } },
};
export default meta;
type Story = StoryObj<typeof Switch>;

export const Playground: Story = {};
export const DefaultOn: Story = { args: { defaultChecked: true } };
export const Disabled: Story = { args: { disabled: true } };

export const Toggle: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const sw = c.getByRole('switch');
    expect(sw).not.toBeChecked();
    await userEvent.click(sw);
    expect(sw).toBeChecked();
  },
};

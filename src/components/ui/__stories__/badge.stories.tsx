import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '../badge';
import { within, expect } from '@storybook/test';

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

/* interaction – แค่ตรวจเนื้อหา / role */
export const Renders: Story = {
  play: async ({ canvasElement, args }) => {
    const badge = within(canvasElement).getByText(args.children as string);
    expect(badge).toBeInTheDocument();
  },
};

// src/components/ui/__stories__/tooltip.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip, TooltipTrigger, TooltipContent } from '../tooltip';
import { Button } from '../button';
import { userEvent, within, expect } from '@storybook/test';

const meta: Meta = {
  title: 'UI/Tooltip',
  tags: ['autodocs'],
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button>Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>Tooltip content</TooltipContent>
    </Tooltip>
  ),
};
export default meta;
type Story = StoryObj;

export const Basic: Story = {};

export const Hover = {
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole('button', { name: /hover me/i });

    // 1) hover ให้ Tooltip เปิด
    await userEvent.hover(btn);

    // 2) ค้น tooltip จากทั้งหน้า (เพราะ Radix portal ไปที่ <body>)
    const page = within(document.body);
    const tip = await page.findByRole('tooltip'); // ✅ มี findByRole

    // 3) ตรวจข้อความ
    expect(tip).toHaveTextContent(/tooltip content/i);
  },
};

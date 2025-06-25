// src/components/ui/__stories__/button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../button';

import { useState } from 'react';
import { userEvent, within, expect } from '@storybook/test';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'], // ให้ addon-docs gen หน้า Docs อัตโนมัติ
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

/* -------------------------------------------------------------------------- */
/*  Story พื้นฐาน                                                             */
/* -------------------------------------------------------------------------- */

export const Playground: Story = {};

export const Outline: Story = {
  args: { variant: 'outline' },
};

export const Destructive: Story = {
  args: { variant: 'destructive' },
};

/* -------------------------------------------------------------------------- */
/*  Story พร้อม interaction test                                              */
/* -------------------------------------------------------------------------- */

export const Clickable: Story = {
  // label & props เริ่มต้น
  args: { children: 'Click me' },

  // render wrapper ใส่ state นับคลิก
  render: (args) => {
    const [count, setCount] = useState(0);

    return (
      <Button {...args} onClick={() => setCount((c) => c + 1)}>
        {count === 0 ? args.children : `Clicked ${count}`}
      </Button>
    );
  },

  // play function → จำลอง user + assertion
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole('button', { name: /click me/i });

    await userEvent.click(btn);
    expect(btn).toHaveTextContent(/clicked 1/i);

    await userEvent.click(btn);
    expect(btn).toHaveTextContent(/clicked 2/i);
  },
};

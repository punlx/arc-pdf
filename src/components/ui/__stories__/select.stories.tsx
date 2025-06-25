// src/components/ui/__stories__/select.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../select';
import { userEvent, within, expect } from '@storybook/test';

const Template = (args: any) => (
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
);

const meta: Meta = {
  title: 'UI/Select',
  render: Template,
  tags: ['autodocs'],
  argTypes: { disabled: { control: 'boolean' } },
};
export default meta;
type Story = StoryObj;

export const Playground: Story = {};
export const Disabled: Story = { args: { disabled: true } };

/* interaction */
export const ChooseItem: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 1. คลิกเปิด dropdown
    const trigger = canvas.getByRole('combobox');
    await userEvent.click(trigger);

    // 2. ค้น option จากทั้งหน้า (portalled) แล้วคลิก
    const page = within(document.body); // 👈 เลิกจำกัดขอบเขต
    await userEvent.click(page.getByRole('option', { name: /orange/i }));

    // 3. ตรวจว่าค่าบน Trigger เปลี่ยน
    expect(trigger).toHaveTextContent(/orange/i);
  },
};

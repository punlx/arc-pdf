// src/components/ui/__stories__/tooltip.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip, TooltipTrigger, TooltipContent } from '../tooltip';
import { Button } from '../button';

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
export const Basic: StoryObj = {};

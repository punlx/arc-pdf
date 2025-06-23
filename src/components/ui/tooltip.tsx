import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from '@/lib/utils';

/**
 * A very small shadcn-style wrapper around Radix Tooltip
 * -------------------------------------------------------
 * Usage:
 * <Tooltip label="Hello there">
 *   <button>hover me</button>
 * </Tooltip>
 */
export const Tooltip = ({
  label,
  children,
  side = 'top',
  delay = 300,
  className,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  delay?: number;
  className?: string;
}) => (
  <TooltipPrimitive.Provider delayDuration={delay}>
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          className={cn(
            'z-50 rounded-md bg-muted px-3 py-1.5 text-xs text-muted-foreground shadow-md animate-in fade-in-0 zoom-in-95',
            className
          )}
        >
          {label}
          <TooltipPrimitive.Arrow className="fill-muted" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  </TooltipPrimitive.Provider>
);

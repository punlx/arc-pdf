// src/components/ui/separator.tsx
'use client';

import * as React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cn } from '@/lib/utils';

function Separator({
  className,
  orientation = 'horizontal',
  decorative = false, // ⬅︎ แก้ค่าเริ่มต้นเป็น false
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      role="separator" // ⬅︎ ย้ำให้แน่ใจว่าใส่ role ถ้าอยาก force
      decorative={decorative}
      orientation={orientation}
      data-slot="separator"
      className={cn(
        'bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
        className
      )}
      {...props}
    />
  );
}

export { Separator };

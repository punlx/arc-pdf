// src/components/ThemeProvider.tsx
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ReactNode } from 'react';

export const ThemeProvider = ({ children }: { children: ReactNode }) => (
  <NextThemesProvider
    attribute="class" // เพิ่ม class="dark" บน <html> ให้อัตโนมัติ
    defaultTheme="system" // ตาม system ก่อน ผู้ใช้สลับได้
    enableSystem
  >
    {children}
  </NextThemesProvider>
);

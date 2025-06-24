// src/components/layout/AppShell.tsx

import { type ReactNode } from 'react';
import { SessionsSidebar } from '@/components/layout/SessionsSidebar';
import { Toaster } from 'sonner';
import { Header } from './็Header';
import { useSessionsSync } from '@/hooks/useSessionsSync'; // 🆕 Import hook

export const AppShell = ({ children }: { children: ReactNode }) => {
  // 🚀 เรียกใช้ hook สำหรับ fetch session ที่นี่
  // เพื่อให้ทำงานทันทีที่ App โหลด และทำงานเพียงครั้งเดียว
  useSessionsSync();

  return (
    <>
      <Toaster richColors position="top-center" duration={3000} />

      <SessionsSidebar>
        <main className="flex flex-col h-100vh w-full">
          <Header></Header>
          {children}
        </main>
      </SessionsSidebar>
    </>
  );
};

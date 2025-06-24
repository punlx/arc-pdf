// src\components\layout\AppShell.tsx

import { type ReactNode } from 'react';

import { SessionsSidebar } from '@/components/sessions/SessionsSidebar';

import { toast, Toaster } from 'sonner';
import { Header } from './Header';

export const AppShell = ({ children }: { children: ReactNode }) => {
  // v2

  /* ──────────── Render ──────────── */
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

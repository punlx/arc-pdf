import { useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, MessageCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { MemoryBadge } from '@/components/memory/MemoryBadge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';

import { UploadPanel } from '@/components/upload/UploadPanel';
import { SessionsSidebar } from '@/components/sessions/SessionsSidebar';

import { useChatStore } from '@/stores/chatStore';
import { useFilesStore } from '@/stores/filesStore';
import { useConfigStore } from '@/stores/configStore';
import { useSessionsStore } from '@/stores/sessionsStore'; // 🆕

import { client } from '@/api/client';
import { toast, Toaster } from 'sonner';
import { fullReset } from '@/lib/fullReset';
import { useSidebar } from '../ui/sidebar';
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

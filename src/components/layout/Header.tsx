// src\components\layout\Header.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Settings, MessageSquare, Glasses } from 'lucide-react';

import { MemoryBadge } from '@/components/memory/MemoryBadge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

import { useSidebar } from '../ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { ThemeSelect } from '@/components/theme/ThemeSelect'; // 🆕 ใช้ Select ใหม่

import { useChatStore } from '@/stores/chatStore';
import { useFilesStore } from '@/stores/filesStore';
import { useConfigStore } from '@/stores/configStore';
import { useSessionsStore } from '@/stores/sessionsStore';

import { client } from '@/api/client';
import { toast } from 'sonner';
import { fullReset } from '@/lib/fullReset';
import { ThemeToggle } from '../theme/ThemeToggle';

export const Header = () => {
  /* ───── libs & hooks ───── */
  const { open, openMobile, isMobile } = useSidebar();
  const isCollapsed = isMobile ? !openMobile : !open;

  const location = useLocation();
  const navigate = useNavigate();
  const isMobileScreen = useIsMobile();

  /* ───── global states ───── */
  const { chatId } = useChatStore();
  const clearFiles = useFilesStore((s) => s.clear);
  const setFiles = useFilesStore((s) => s.setFiles);

  const useStream = useConfigStore((s) => s.useStream);
  const setUseStream = useConfigStore((s) => s.setUseStream);

  const removeSession = useSessionsStore((s) => s.removeSession);
  const clearSessions = useSessionsStore((s) => s.clear);

  /* ───── auto-close side drawers ≥ lg ───── */
  const [dummy, setDummy] = useState(false); // placeholder — ไม่มีผล แต่คง structure เดิม
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const close = () => setDummy(false);
    mq.addEventListener('change', close);
    return () => mq.removeEventListener('change', close);
  }, []);

  /* ───── reset handler ───── */
  async function handleReset() {
    if (!window.confirm('ล้างแชตและไฟล์ทั้งหมด ?')) return;

    try {
      await fullReset(chatId);

      chatId ? (clearFiles(), removeSession(chatId)) : (clearFiles(), clearSessions());

      if (!chatId) {
        const res = await client.get('/api/files', { params: { chat_id: '' } }).catch(() => null);
        if (res?.data?.total_files) {
          setFiles(res.data.files);
          toast.info('ไฟล์เดิมยังอยู่ที่เซิร์ฟเวอร์');
        }
      }

      navigate('/');
      toast.success('รีเซ็ตเรียบร้อย');
    } catch (e: any) {
      toast.error(e?.message ?? 'Reset failed');
    }
  }

  /* ───── render ───── */
  return (
    <header
      className={`${
        !isCollapsed ? 'pl-4' : 'pl-14'
      } pr-4 h-[60px] flex items-center justify-between w-full border-b-2 sticky top-0 bg-background z-20 transition-all`}
    >
      <div className="text-xl font-medium">ArcPDF</div>

      <div className="flex items-center gap-4">
        {location.pathname === '/' ? (
          <div>
            <ThemeToggle></ThemeToggle>
          </div>
        ) : (
          <>
            <MemoryBadge />

            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>

            {/* inline stream toggle เมื่อ ≥ md */}
            {!isMobileScreen && (
              <div className="flex items-center gap-1 text-xs">
                <span>REST</span>
                <Switch
                  checked={useStream}
                  onCheckedChange={setUseStream}
                  aria-label="toggle streaming"
                />
                <span>WS</span>
                <ThemeToggle></ThemeToggle>
              </div>
            )}

            {/* Settings drawer ดึงลงจากด้านบน */}
            {isMobileScreen && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="settings"
                    className="rounded-full"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                </SheetTrigger>

                <SheetContent
                  side="top"
                  className="w-full max-w-none rounded-b-2xl border-b-2 shadow-lg bg-background"
                >
                  {/* header */}
                  <SheetHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Settings />
                      <SheetTitle>Settings</SheetTitle>
                    </div>
                    <SheetClose asChild></SheetClose>
                  </SheetHeader>

                  {/* body */}
                  <div className="flex flex-col gap-2 px-5 pb-4">
                    {/* Chat row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>Streaming</span>
                      </div>

                      <div className="flex items-center gap-1 text-xs">
                        <span>REST</span>
                        <Switch
                          checked={useStream}
                          onCheckedChange={setUseStream}
                          aria-label="toggle streaming"
                        />
                        <span>WS</span>
                      </div>
                    </div>

                    <Separator />

                    {/* Theme row –– เปลี่ยนเป็น Select */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Glasses className="h-4 w-4" />
                        <span className="text-sm">Theme</span>
                      </div>
                      <ThemeSelect /> {/* 🆕 */}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </>
        )}
      </div>
    </header>
  );
};

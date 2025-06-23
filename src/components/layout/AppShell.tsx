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

export const AppShell = ({ children }: { children: ReactNode }) => {
  /* ──────────── Zustand selectors ──────────── */
  const { chatId } = useChatStore();

  const clearFiles = useFilesStore((s) => s.clear);
  const setFiles = useFilesStore((s) => s.setFiles);

  const useStream = useConfigStore((s) => s.useStream);
  const setUseStream = useConfigStore((s) => s.setUseStream);

  const removeSession = useSessionsStore((s) => s.removeSession); // 🆕
  const clearSessions = useSessionsStore((s) => s.clear); // 🆕

  const navigate = useNavigate();

  /* ──────────── Drawer state ──────────── */
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  /* ปิด Drawer เมื่อ viewport ≥ 1024px (lg) */
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const close = () => {
      setLeftOpen(false);
      setRightOpen(false);
    };
    mq.addEventListener('change', close);
    return () => mq.removeEventListener('change', close);
  }, []);

  /* ──────────── Reset handler ──────────── */
  async function handleReset() {
    if (!window.confirm('ล้างแชตและไฟล์ทั้งหมด ?')) return;

    try {
      // 1) เรียก backend
      await fullReset(chatId);

      // 3) เคลียร์ หรือรีเฟรชไฟล์ฝั่งซ้าย
      if (chatId) {
        clearFiles(); // ไฟล์ของ session นี้
        removeSession(chatId); // ลบจาก sidebar
      } else {
        clearFiles();
        clearSessions(); // ฟูลรีเซ็ต
      }

      // 4) เช็กว่ายังมีไฟล์เหลือไหมใน server (กรณี full-reset false positive)
      if (!chatId) {
        const res = await client.get('/api/files', { params: { chat_id: '' } }).catch(() => null);
        if (res?.data?.total_files) {
          setFiles(res.data.files);
          toast.info('ไฟล์เดิมยังอยู่ที่เซิร์ฟเวอร์');
        }
      }

      // 5) นำทางกลับ root
      navigate('/');

      toast.success('รีเซ็ตเรียบร้อย');
    } catch (e: any) {
      toast.error(e?.message ?? 'Reset failed');
    }
  }

  /* ──────────── Render ──────────── */
  return (
    <>
      <Toaster richColors position="top-center" duration={3000} />

      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-4 h-14 border-b">
          {/* ----- Left: Logo + Upload Drawer ----- */}
          <div className="flex items-center gap-2">
            <Sheet open={leftOpen} onOpenChange={setLeftOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  aria-label="open upload sidebar"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-80">
                <UploadPanel compact />
              </SheetContent>
            </Sheet>

            <h1 className="font-semibold whitespace-nowrap">ArcFusion PDF QA</h1>
          </div>

          {/* ----- Right: Toggles + Sessions drawer ----- */}
          <div className="flex items-center gap-4">
            {/* Mobile sessions drawer */}
            <Sheet open={rightOpen} onOpenChange={setRightOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  aria-label="open sessions sidebar"
                >
                  <MessageCircle className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0 w-80">
                <SessionsSidebar />
              </SheetContent>
            </Sheet>

            {/* Streaming toggle */}
            <div className="flex items-center gap-1 text-xs">
              <span>REST</span>
              <Switch
                checked={useStream}
                onCheckedChange={setUseStream}
                aria-label="toggle streaming"
              />
              <span>WS</span>
            </div>

            <MemoryBadge />
            <ThemeToggle />

            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </header>

        {/* Body */}
        <main className="flex-1 flex">
          {children}
          <div className="hidden lg:block">
            <SessionsSidebar />
          </div>
        </main>
      </div>
    </>
  );
};

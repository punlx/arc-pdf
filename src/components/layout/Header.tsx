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
import { useLocation } from 'react-router-dom';

export const Header = () => {
  const { open } = useSidebar();
  const location = useLocation();
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

  return (
    <>
      <div
        className={`${
          open ? 'pl-4' : ' pl-14'
        } pr-4 h-[60px] items-center flex transition-all justify-between w-full border-b-2 sticky top-0 bg-background z-20`}
      >
        <div className="text-xl font-medium">ArcPDF</div>

        <div className="flex items-center gap-4">
          {location.pathname !== '/' && (
            <div className="flex items-center gap-4">
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

              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
            </div>
          )}

          <ThemeToggle />
        </div>
      </div>
    </>
  );
};

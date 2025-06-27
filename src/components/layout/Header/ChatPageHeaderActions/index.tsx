import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MemoryBadge } from '@/components/memory/MemoryBadge';
import { ThemeToggle } from '@/components/layout/Header/ThemeToggle';
import { useIsMobile } from '@/hooks/useMobile';
import { useChatStore } from '@/stores/chatStore';
import { fullReset } from '@/lib/fullReset';
import { StreamModeToggle } from './StreamModeToggle';
import { MobileSettingsSheet } from './MobileSettingsSheet';

export const ChatPageHeaderActions = () => {
  const navigate = useNavigate();
  const isMobileScreen = useIsMobile();
  const chatId = useChatStore((s) => s.chatId);

  async function handleReset() {
    if (!window.confirm('ล้างแชตและไฟล์ทั้งหมด ?')) return;
    await fullReset(chatId, navigate);
  }

  return (
    <>
      <MemoryBadge />
      <Button variant="outline" onClick={handleReset}>
        Reset
      </Button>

      {!isMobileScreen && (
        <>
          <StreamModeToggle />
          <ThemeToggle />
        </>
      )}

      {isMobileScreen && <MobileSettingsSheet />}
    </>
  );
};

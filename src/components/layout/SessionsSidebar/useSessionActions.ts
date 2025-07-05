import { useNavigate } from 'react-router-dom';
import { fullReset } from '@/lib/fullReset';
import { useSessionsStore } from '@/stores/sessionsStore';
import { useSidebar } from '@/components/ui/sidebar';

export const useSessionActions = () => {
  const navigate = useNavigate();
  const { sessions, bringToFront } = useSessionsStore();
  const { isMobile, setOpenMobile } = useSidebar();

  const handleSelectSession = (chatId: string) => {
    bringToFront(chatId);

    const selectedSession = sessions.find((s) => s.chat_id === chatId);
    if (selectedSession?.first_question) {
      document.title = `ArcPDF - ${selectedSession.first_question}`;
    } else {
      document.title = 'ArcPDF';
    }

    navigate(`/${chatId}`);

    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleDeleteSession = (chatId: string) => {
    if (window.confirm('ลบแชตนี้ทั้งหมด ?')) {
      fullReset(chatId, navigate);
      document.title = 'ArcPDF';
    }
  };

  return { handleSelectSession, handleDeleteSession };
};

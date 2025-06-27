import { resetSession } from '@/api/reset';
import { client } from '@/api/client';
import { useChatStore } from '@/stores/chatStore';
import { useFilesStore } from '@/stores/filesStore';
import { useSessionsStore } from '@/stores/sessionsStore';
import { toast } from 'sonner';
import type { NavigateFunction } from 'react-router-dom';

export async function fullReset(chatId: string | null, navigate: NavigateFunction) {
  const { reset: resetChat, setMemory } = useChatStore.getState();
  const { clear: clearFiles, setFiles } = useFilesStore.getState();
  const { removeSession, clear: clearSessions } = useSessionsStore.getState();

  try {
    await resetSession(chatId ? { chat_id: chatId } : {});

    resetChat();
    setMemory(false);

    if (chatId) {
      clearFiles();
      removeSession(chatId);
    } else {
      clearFiles();
      clearSessions();
    }

    navigate('/');
    toast.success('Completed reset');

    if (!chatId) {
      const res = await client.get('/api/files').catch(() => null);
      if (res?.data?.total_files > 0) {
        setFiles(res?.data.files);
        toast.info('Some original files are still on the server.');
      }
    }
  } catch (e: any) {
    toast.error(e?.message ?? 'Reset failed');
  }
}

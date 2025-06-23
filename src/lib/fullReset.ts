// fullReset: call backend reset + เคลียร์ state ฝั่ง FE ให้เหมือนปุ่ม Reset
import { resetSession } from '@/api/reset';
import { client } from '@/api/client';
import { useChatStore } from '@/stores/chatStore';
import { useFilesStore } from '@/stores/filesStore';
import { useSessionsStore } from '@/stores/sessionsStore';
import { toast } from 'sonner';

export async function fullReset(chatId: string | null) {
  const { reset: resetChat, setMemory } = useChatStore.getState();
  const { clear: clearFiles, setFiles } = useFilesStore.getState();
  const { removeSession, clear: clearSessions } = useSessionsStore.getState();

  try {
    // 1) backend
    await resetSession(chatId ? { chat_id: chatId } : {});

    // 2) FE stores
    resetChat();
    setMemory(false);

    if (chatId) {
      clearFiles();
      removeSession(chatId);
    } else {
      clearFiles();
      clearSessions();
    }

    // 3) sync files leftover (same as AppShell logic)
    const res = await client.get('/api/files').catch(() => null);
    if (res?.data?.total_files) {
      setFiles(res.data.files);
      toast.info('ไฟล์เดิมยังอยู่ที่เซิร์ฟเวอร์');
    }

    toast.success('รีเซ็ตเรียบร้อย');
  } catch (e: any) {
    toast.error(e?.message ?? 'Reset failed');
    throw e; // เผื่อ caller ต้องจับ error
  }
}

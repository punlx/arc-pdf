// src/lib/fullReset.ts

import { resetSession } from '@/api/reset';
import { client } from '@/api/client';
import { useChatStore } from '@/stores/chatStore';
import { useFilesStore } from '@/stores/filesStore';
import { useSessionsStore } from '@/stores/sessionsStore';
import { toast } from 'sonner';
import type { NavigateFunction } from 'react-router-dom';

/**
 * Performs a full reset of the application state for a given chat session, or all sessions.
 * This function handles API calls, client-side state updates, and user notifications.
 * @param chatId The ID of the chat to reset, or null to reset the entire application.
 * @param navigate The navigate function from react-router-dom to redirect the user.
 */
export async function fullReset(chatId: string | null, navigate: NavigateFunction) {
  const { reset: resetChat, setMemory } = useChatStore.getState();
  const { clear: clearFiles, setFiles } = useFilesStore.getState();
  const { removeSession, clear: clearSessions } = useSessionsStore.getState();

  try {
    // 1) บอก Backend ให้รีเซ็ต session
    await resetSession(chatId ? { chat_id: chatId } : {});

    // 2) อัปเดต state ฝั่ง Frontend
    resetChat();
    setMemory(false);

    if (chatId) {
      clearFiles();
      removeSession(chatId);
    } else {
      clearFiles();
      clearSessions();
    }

    // 3) จัดการ redirect และแจ้งเตือนผู้ใช้
    navigate('/');
    toast.success('รีเซ็ตเรียบร้อย');

    // 4) เช็คไฟล์ที่อาจตกค้างบน server (กรณีรีเซ็ตทั้งหมด)
    // แล้วแสดงข้อมูลให้ผู้ใช้ทราบ
    if (!chatId) {
      const res = await client.get('/api/files').catch(() => null);
      if (res?.data?.total_files > 0) {
        setFiles(res?.data.files);
        toast.info('ไฟล์เดิมบางส่วนยังอยู่ที่เซิร์ฟเวอร์');
      }
    }
  } catch (e: any) {
    toast.error(e?.message ?? 'Reset failed');
    // ไม่ต้อง throw error ต่อ เพราะเราจัดการแจ้งผู้ใช้แล้ว
  }
}

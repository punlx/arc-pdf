// src/hooks/useChatSubmit.ts

import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';

import { useChatStore } from '@/stores/chatStore';
import { useConfigStore } from '@/stores/configStore';
import { useFilesStore } from '@/stores/filesStore';
import { useSessionsStore } from '@/stores/sessionsStore';

import { sendChat } from '@/api/chat';
import { sendChatWS, genTempId } from '@/api/wsChat';
import { client } from '@/api/client';

export function useChatSubmit() {
  const navigate = useNavigate();

  const { chatId, setChatId, addMessage, updateMessage, sending, setSending, setMemory } =
    useChatStore();
  const useStream = useConfigStore((s) => s.useStream);
  const filesCount = useFilesStore((s) => s.files.length > 0);
  const setSessions = useSessionsStore((s) => s.setSessions);

  const refreshSessions = async () => {
    try {
      const res = await client.get('/api/chat');
      setSessions(res.data.chats);
    } catch {
      /* network error – เงียบไว้ */
    }
  };

  const submitChat = async (question: string) => {
    const q = question.trim();
    if (!q || sending) return;

    if (!filesCount) {
      toast.warning('กรุณาอัปโหลด PDF ก่อนถามคำถาม');
      return;
    }

    const userId = uuid();
    addMessage({ id: userId, role: 'user', text: q });

    setSending(true);

    if (useStream) {
      const botId = genTempId();
      addMessage({ id: botId, role: 'bot', text: '...' });

      sendChatWS(
        { question: q, chat_id: chatId ?? undefined },
        {
          onTyping: () => updateMessage(botId, { text: '...' }),
          onChunk: (chunk) => updateMessage(botId, (prev) => ({ text: prev.text + chunk })),
          onComplete: async (p) => {
            updateMessage(botId, {
              id: p.id ?? botId,
              text: p.answer ?? '',
              source: p.source,
            });

            if (!chatId && p.chat_id) {
              setChatId(p.chat_id);
              navigate(`/${p.chat_id}`);
            }

            await refreshSessions();
            setMemory(true);
            setSending(false);
          },
          onError: (msg) => {
            toast.error(msg);
            updateMessage(botId, { text: `❌ ${msg}` });
            setSending(false);
          },
        }
      );
      return;
    }

    /* ---------------------------------------------------------------- */
    /* ----------- REST (non-stream) - ส่วนที่แก้ไข ------------------ */
    /* ---------------------------------------------------------------- */

    // 🆕 1. สร้าง ID ชั่วคราวและเพิ่ม "Thinking..." bubble ทันที
    const botId = genTempId();
    addMessage({ id: botId, role: 'bot', text: '...' });

    try {
      const res = await sendChat({
        question: q,
        chat_id: chatId ?? undefined,
      });

      // ✅ 2. เมื่อสำเร็จ, "อัปเดต" bubble เดิมด้วยข้อมูลจริง
      updateMessage(botId, {
        id: res.id, // อัปเดต ID ให้เป็น ID จริงจาก server
        text: res.answer,
        source: res.source,
      });

      if (!chatId && res.chat_id) {
        setChatId(res.chat_id);
        navigate(`/${res.chat_id}`);
      }

      setMemory(true);
    } catch (err: any) {
      const msg =
        err?.message === 'Network Error'
          ? 'Network error: กรุณาตรวจสอบการเชื่อมต่อ'
          : err?.message ?? 'Chat failed';

      toast.error(msg);

      // ❌ 3. เมื่อพลาด, "อัปเดต" bubble เดิมด้วยข้อความ error
      updateMessage(botId, {
        text: `❌ ${msg}`,
      });
    } finally {
      await refreshSessions();
      setSending(false);
    }
  };

  return { isSubmitting: sending, submitChat };
}

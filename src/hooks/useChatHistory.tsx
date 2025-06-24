// src/hooks/useChatHistory.ts

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { client } from '@/api/client';
import { useChatStore, type Message } from '@/stores/chatStore';
import { useSessionsStore } from '@/stores/sessionsStore';

interface ChatEntry {
  id: string;
  question: string;
  answer: string;
  source: string;
  timestamp: string;
  chat_id: string;
}

export function useChatHistory(chatId: string | undefined) {
  const navigate = useNavigate();
  const { setChatId, setMessages, reset: resetChat } = useChatStore();
  const { addSession, sessions } = useSessionsStore();

  useEffect(() => {
    // ถ้าไม่มี chatId ใน URL (เช่น อยู่ที่หน้าแรก) ให้รีเซ็ต state ของแชท
    if (!chatId) {
      resetChat();
      return;
    }

    const fetchHistory = async () => {
      try {
        const res = await client.get(`/api/chat/${chatId}`);
        const entries = res.data.messages as ChatEntry[];

        /* ---- แปลง history เป็น Message[] ---- */
        const msgs: Message[] = entries.flatMap((e) => [
          { id: `${e.id}-q`, role: 'user', text: e.question },
          { id: e.id, role: 'bot', text: e.answer, source: e.source },
        ]);

        setChatId(chatId);
        setMessages(msgs);

        /* ---- เพิ่ม session เข้าไปใน list (ถ้ายังไม่มี) ---- */
        if (entries.length > 0) {
          const isSessionExisting = sessions.some((s) => s.chat_id === chatId);

          if (!isSessionExisting) {
            addSession({
              chat_id: chatId,
              first_question: entries[0].question,
              last_message_time: entries[entries.length - 1].timestamp,
              message_count: entries.length,
            });
          }
        }
      } catch {
        /* chat ไม่เจอ → กลับหน้าแรก */
        navigate('/');
      }
    };

    fetchHistory();
  }, [chatId, setChatId, setMessages, addSession, navigate, resetChat, sessions]);
}

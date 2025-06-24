// src/components/chat/ChatPanel.tsx
import { ChatWindow } from '../components/chat/ChatWindow';
import { InputBar } from '../components/chat/InputBar';
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { useFilesSync } from '@/hooks/useFilesSync';
import { useSessionsSync } from '@/hooks/useSessionsSync';
import { client } from '@/api/client';
import { useChatStore, type Message } from '@/stores/chatStore';
import { useSessionsStore } from '@/stores/sessionsStore';

/* ---------- ช่วย TypeScript ---------- */
interface ChatEntry {
  id: string;
  question: string;
  answer: string;
  source: string;
  timestamp: string;
  chat_id: string;
}

export const ChatPage = () => {
  const { chatId: paramId } = useParams<{ chatId?: string }>();
  const navigate = useNavigate();

  const { setChatId, setMessages, reset: resetChat } = useChatStore();
  const addSession = useSessionsStore((s) => s.addSession);

  useFilesSync(paramId || null); // sync files + memory badge
  useSessionsSync(); // sync sessions list

  /* ---------- โหลด history เมื่อเปลี่ยน URL ---------- */
  useEffect(() => {
    if (!paramId) {
      resetChat(); // เคลียร์ state ถ้าไม่มี chatId ใน URL
      return;
    }

    (async () => {
      try {
        const res = await client.get(`/api/chat/${paramId}`);
        const entries = res.data.messages as ChatEntry[];

        /* ---- แปลง history เป็น Message[] ---- */
        const msgs: Message[] = entries.flatMap((e) => [
          { id: `${e.id}-q`, role: 'user', text: e.question },
          { id: e.id, role: 'bot', text: e.answer, source: e.source },
        ]);

        setChatId(paramId);
        setMessages(msgs);

        /* ---- เพิ่ม meta sessionเฉพาะกรณีมีข้อความ ---- */
        if (entries.length > 0) {
          const already = useSessionsStore.getState().sessions.some((s) => s.chat_id === paramId);

          if (!already) {
            addSession({
              chat_id: paramId,
              first_question: entries[0].question,
              last_message_time: entries[entries.length - 1].timestamp,
              message_count: entries.length,
            });
          }
        }
      } catch {
        /* chat ไม่เจอ → กลับหน้า root */
        navigate('/');
      }
    })();
  }, [paramId, setChatId, setMessages, addSession, navigate, resetChat]);

  return (
    <div className="h-[calc(100vh-60px)] py-8 flex justify-center">
      <div className="transition-all max-lg:w-[500px] max-xl:w-[600px] max-2xl:w-[700px] 2xl:w-[900px]">
        <ChatWindow />
        <InputBar />
      </div>
    </div>
  );
};

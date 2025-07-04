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
    if (!chatId) {
      resetChat();
      return;
    }

    const fetchHistory = async () => {
      try {
        // TODO: ให้ทำเป็น constant API URL แทน
        const res = await client.get(`/api/chat/${chatId}`);
        const entries = res.data.messages as ChatEntry[];

        const msgs: Message[] = entries.flatMap((e) => [
          { id: `${e.id}-q`, role: 'user', text: e.question },
          { id: e.id, role: 'bot', text: e.answer, source: e.source },
        ]);

        setChatId(chatId);
        setMessages(msgs);

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
        navigate('/');
      }
    };

    fetchHistory();
  }, [chatId, setChatId, setMessages, addSession, navigate, resetChat, sessions]);
}

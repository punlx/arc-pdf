import { genTempId, sendChatWS } from '@/api/wsChat';
import { toast } from 'sonner';

export function handleStreamChat({
  question,
  chatId,
  addMessage,
  updateMessage,
  setChatId,
  navigate,
  refreshSessions,
  setMemory,
  setSending,
}: {
  question: string;
  chatId: string | null;
  addMessage: Function;
  updateMessage: Function;
  setChatId: Function;
  navigate: Function;
  refreshSessions: () => Promise<void>;
  setMemory: Function;
  setSending: Function;
}) {
  const botId = genTempId();
  addMessage({ id: botId, role: 'bot', text: '...' });

  sendChatWS(
    { question, chat_id: chatId ?? undefined },
    {
      onTyping: () => updateMessage(botId, { text: '...' }),
      onChunk: (chunk) => updateMessage(botId, (prev: any) => ({ text: prev.text + chunk })),
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
      onError: (msg: string) => {
        toast.error(msg);
        updateMessage(botId, { text: `❌ ${msg}` });
        setSending(false);
      },
    }
  );
}

import { sendChat } from '@/api/chat';
import { genTempId } from '@/api/wsChat';
import { toast } from 'sonner';

export async function handleHttpChat({
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

  try {
    const res = await sendChat({ question, chat_id: chatId ?? undefined });

    updateMessage(botId, {
      id: res.id,
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
        ? 'Network error: Please check the connection.'
        : err?.message ?? 'Chat failed';

    toast.error(msg);

    updateMessage(botId, { text: `❌ ${msg}` });
  } finally {
    await refreshSessions();
    setSending(false);
  }
}

import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';

import { useChatStore } from '@/stores/chatStore';
import { useConfigStore } from '@/stores/configStore';
import { useFilesStore } from '@/stores/filesStore';
import { useSessionsStore } from '@/stores/sessionsStore';

import { client } from '@/api/client';

import { handleStreamChat } from './handleStreamChat';
import { handleHttpChat } from './handleHttpChat';

export function useChatSubmit() {
  const navigate = useNavigate();

  const { chatId, setChatId, addMessage, updateMessage, sending, setSending, setMemory } =
    useChatStore();
  const useStream = useConfigStore((s) => s.useStream);
  const hasFile = useFilesStore((s) => s.files.length > 0);
  const setSessions = useSessionsStore((s) => s.setSessions);

  const refreshSessions = async () => {
    try {
      const res = await client.get('/api/chat');
      setSessions(res.data.chats);
    } catch {
      // เงียบไว้
    }
  };

  const submitChat = async (question: string) => {
    const q = question.trim();
    if (!q || sending) return;

    if (!hasFile) {
      toast.warning('Please upload a PDF before asking a question.');
      return;
    }

    const userId = uuid();
    addMessage({ id: userId, role: 'user', text: q });
    setSending(true);

    const commonProps = {
      question: q,
      chatId,
      addMessage,
      updateMessage,
      setChatId,
      navigate,
      refreshSessions,
      setMemory,
      setSending,
    };

    if (useStream) {
      handleStreamChat(commonProps);
    } else {
      await handleHttpChat(commonProps);
    }
  };

  return { isSubmitting: sending, submitChat };
}

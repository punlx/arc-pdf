import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SendHorizonal, Loader2, FileUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';

import { useChatStore } from '@/stores/chatStore';
import { useConfigStore } from '@/stores/configStore';
import { useFilesStore } from '@/stores/filesStore';
import { useSessionsStore } from '@/stores/sessionsStore';

import { sendChat } from '@/api/chat';
import { sendChatWS, genTempId } from '@/api/wsChat';
import { client } from '@/api/client';
import { usePdfUploader } from '@/hooks/usePdfUploader';
import { useDropzone } from 'react-dropzone';
import { UploadPanel } from '../upload/UploadPanel';

export const InputBar = () => {
  const [text, setText] = useState('');
  const messages = useChatStore((s) => s.messages);

  /* ──────────── stores ──────────── */
  const { chatId, setChatId, addMessage, updateMessage, sending, setSending, setMemory } =
    useChatStore();

  const useStream = useConfigStore((s) => s.useStream);
  const filesCount = useFilesStore((s) => s.files.length);
  const hasFiles = filesCount > 0;

  const setSessions = useSessionsStore((s) => s.setSessions);

  const navigate = useNavigate();

  /* ──────────── helper : refresh sessions list ──────────── */
  const refreshSessions = async () => {
    try {
      const res = await client.get('/api/chat');
      setSessions(res.data.chats); // Sidebar จะอัปเดตจาก backend
    } catch {
      /* network error – เงียบไว้ */
    }
  };

  /* ──────────── submit handler ──────────── */
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = text.trim();
    if (!q || sending) return;

    if (!hasFiles) {
      toast.warning('กรุณาอัปโหลด PDF ก่อนถามคำถาม');
      return;
    }

    /* optimistic user message */
    const userId = uuid();
    addMessage({ id: userId, role: 'user', text: q });

    setText('');
    setSending(true);

    /* ---------------------------------------------------------------- */
    /* ----------- WebSocket (stream)  -------------------------------- */
    /* ---------------------------------------------------------------- */
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

            /* session ใหม่ → เพียงบันทึก chatId + navigate */
            if (!chatId && p.chat_id) {
              setChatId(p.chat_id);
              navigate(`/${p.chat_id}`);
            }

            await refreshSessions(); // sync ตัวเลข/รายการ
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
    /* ----------- REST (non-stream) ---------------------------------- */
    /* ---------------------------------------------------------------- */
    try {
      const res = await sendChat({
        question: q,
        chat_id: chatId ?? undefined,
      });

      addMessage({
        id: res.id,
        role: 'bot',
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

      addMessage({
        id: uuid(),
        role: 'bot',
        text: `❌ ${msg}`,
      });
    } finally {
      await refreshSessions();
      setSending(false);
    }
  }
  // v2
  const { uploadPdfFiles, loading } = usePdfUploader();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: uploadPdfFiles,
    accept: { 'application/pdf': [] },
    multiple: true,
  });

  /* ──────────── UI ──────────── */
  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-center gap-2 sticky bottom-8 z-50 bg-background transition-all ${
        messages.length ? '0' : '0'
      }`}
    >
      <div className="w-full bg-background p-4 border-2 rounded-4xl flex flex-col gap-4">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask anything..."
          className="border-none focus-visible:shadow-none"
          disabled={sending}
        />
        <div className="flex justify-between gap-3">
          <UploadPanel></UploadPanel>

          <Button className='cursor-pointer' type="submit" variant={'outline'} disabled={sending || !text.trim() || !hasFiles}>
            {sending ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <SendHorizonal className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

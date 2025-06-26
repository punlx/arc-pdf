import { useEffect } from 'react';
import { z } from 'zod';

import { fetchFiles } from '@/api/files';
import { useFilesStore } from '@/stores/filesStore';
import { useChatStore } from '@/stores/chatStore';
import { client } from '@/api/client';

const statusResSchema = z.object({
  has_memory: z.boolean(),
  session_id: z.string(),
  uploaded_files_count: z.number(),
  chat_history_count: z.number(),
  chat_sessions_count: z.number(),
});
type StatusParsed = z.infer<typeof statusResSchema>;

export function useFilesSync(chatId: string | null) {
  const setFiles = useFilesStore((s) => s.setFiles);
  const setMemory = useChatStore((s) => s.setMemory);

  useEffect(() => {
    if (!chatId) {
      setFiles([]);
      return;
    }

    (async () => {
      try {
        const [filesRes, statusRes] = await Promise.all([
          fetchFiles(chatId),
          client.get('/api/status'),
        ]);

        const status: StatusParsed = statusResSchema.parse(statusRes.data);

        setFiles(filesRes.files); // ← ใช้ผลที่ parse แล้ว
        setMemory(status.has_memory);
      } catch {}
    })();
  }, [chatId, setFiles, setMemory]);
}

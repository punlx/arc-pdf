// src\hooks\useFilesSync.tsx
import { useEffect } from 'react';
import { fetchFiles } from '@/api/files';
import { useFilesStore } from '@/stores/filesStore';
import { useChatStore } from '@/stores/chatStore';
import { client } from '@/api/client';

/** sync files for current chatId */
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
        setFiles(filesRes.data.files);
        setMemory(statusRes.data.has_memory);
      } catch {
        /* silent */
      }
    })();
  }, [chatId, setFiles, setMemory]);
}

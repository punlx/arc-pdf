// src\hooks\useFilesSync.tsx
import { useEffect } from 'react';
import { fetchFiles } from '@/api/files';
import { useFilesStore } from '@/stores/filesStore';
import { useChatStore } from '@/stores/chatStore';

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
          fetch('http://localhost:8000/api/status').then((r) => r.json()),
        ]);
        setFiles(filesRes.data.files);
        setMemory(statusRes.has_memory);
      } catch {
        /* silent */
      }
    })();
  }, [chatId, setFiles, setMemory]);
}

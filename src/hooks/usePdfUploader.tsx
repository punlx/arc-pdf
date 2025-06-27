import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { uploadFiles } from '@/api/upload';
import { client } from '@/api/client';
import { useFilesStore } from '@/stores/filesStore';
import { useChatStore } from '@/stores/chatStore';

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

const createChatResSchema = z.object({
  chat_id: z.string().uuid(),
  message: z.string(),
});
type CreateChatParsed = z.infer<typeof createChatResSchema>;

export function usePdfUploader() {
  const [loading, setLoading] = useState(false);

  const addMany = useFilesStore((s) => s.addMany);
  const curFiles = useFilesStore((s) => s.files);

  const { chatId, setChatId } = useChatStore();
  const navigate = useNavigate();

  const handleFiles = useCallback(
    async (files: File[]) => {
      if (!files.length) return;

      const curNames = new Set(curFiles.map((f) => f.filename.toLowerCase()));
      const deduped = files.filter((f) => !curNames.has(f.name.toLowerCase()));
      if (!deduped.length) {
        toast.warning('selected files already exist.');
        return;
      }

      const oversize = deduped.filter((f) => f.size > MAX_SIZE);
      if (oversize.length) {
        toast.error(
          `${oversize
            .slice(0, 3)
            .map((f) => f.name)
            .join(', ')} Over 10 MB and will not upload.`
        );
      }

      const valid = deduped.filter((f) => f.size <= MAX_SIZE);
      if (!valid.length) return;

      let targetId = chatId;
      if (!targetId) {
        try {
          const res = await client.post('/api/chat/create');
          const parsed: CreateChatParsed = createChatResSchema.parse(res.data); // ✅ validate
          targetId = parsed.chat_id;
          setChatId(targetId);
          navigate(`/${targetId}`);
        } catch (e: any) {
          toast.error(e?.message ?? 'Unable to create session');
          return;
        }
      }

      setLoading(true);
      try {
        const data = await uploadFiles(valid, targetId);
        addMany(data.files);
        toast.success(data.message);
      } catch (err: any) {
        toast.error(err?.message ?? 'Upload failed');
      } finally {
        setLoading(false);
      }
    },
    [curFiles, chatId, setChatId, addMany, navigate]
  );

  return {
    uploadPdfFiles: handleFiles,
    loading,
  };
}

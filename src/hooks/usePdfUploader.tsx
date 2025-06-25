import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

import { uploadFiles } from '@/api/upload';
import { client } from '@/api/client';
import { useFilesStore } from '@/stores/filesStore';
import { useChatStore } from '@/stores/chatStore';

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

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
        toast.warning('ไฟล์ที่เลือกมีอยู่แล้วทั้งหมด');
        return;
      }

      const oversize = deduped.filter((f) => f.size > MAX_SIZE);
      if (oversize.length) {
        toast.error(
          `${oversize
            .slice(0, 3)
            .map((f) => f.name)
            .join(', ')} เกิน 10 MB และจะไม่อัปโหลด`
        );
      }

      const valid = deduped.filter((f) => f.size <= MAX_SIZE);
      if (!valid.length) return;

      let targetId = chatId;
      if (!targetId) {
        try {
          const res = await client.post('/api/chat/create');
          targetId = res.data.chat_id as string;
          setChatId(targetId);
          navigate(`/${targetId}`);
        } catch (e: any) {
          toast.error(e?.message ?? 'ไม่สามารถสร้าง session');
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

// src/components/upload/DropZone.tsx
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Loader2, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

import { uploadFiles } from '@/api/upload';
import { client } from '@/api/client';
import { useFilesStore } from '@/stores/filesStore';
import { useChatStore } from '@/stores/chatStore';

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export const DropZone = () => {
  /* ---------- stores ---------- */
  const addMany = useFilesStore((s) => s.addMany);
  const curFiles = useFilesStore((s) => s.files);

  const { chatId, setChatId } = useChatStore();

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /* ---------- onDrop ---------- */
  const onDrop = useCallback(
    async (accepted: File[]) => {
      if (!accepted.length) return;

      /* 1) กันชื่อซ้ำ & ไฟล์เกิน ขนาด */
      const curNames = new Set(curFiles.map((f) => f.filename.toLowerCase()));
      const deduped = accepted.filter((f) => !curNames.has(f.name.toLowerCase()));
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

      /* 2) สร้าง chatId ถ้ายังไม่มี (แต่ **ไม่** addSession) */
      let targetId = chatId;
      if (!targetId) {
        try {
          const res = await client.post('/api/chat/create');
          targetId = res.data.chat_id as string;

          setChatId(targetId); // เพียงเก็บไว้ใช้ระหว่างหน้า
          navigate(`/${targetId}`); // เปลี่ยน route ไป /:chatId
        } catch (e: any) {
          toast.error(e?.message ?? 'ไม่สามารถสร้าง session');
          return;
        }
      }

      /* 3) อัปโหลด */
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

  /* ---------- react-dropzone ---------- */
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': [] },
    multiple: true,
  });

  /* ---------- UI ---------- */
  return (
    <div
      {...getRootProps()}
      className={`border-dashed border-2 rounded-md flex flex-col items-center
        justify-center p-6 cursor-pointer transition-colors
        ${isDragActive ? 'border-primary bg-muted/20' : 'border-muted'}`}
    >
      <input {...getInputProps()} />
      {loading ? (
        <>
          <Loader2 className="animate-spin h-6 w-6 mb-2" />
          <p className="text-sm">Uploading…</p>
        </>
      ) : (
        <>
          <UploadCloud className="h-8 w-8 mb-2" />
          <p className="text-sm">
            {isDragActive ? 'ปล่อยไฟล์ที่นี่' : 'ลาก PDF มาวาง หรือคลิกเพื่อเลือกไฟล์ (≤ 10 MB)'}
          </p>
        </>
      )}
    </div>
  );
};

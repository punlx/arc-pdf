// src/components/upload/DropZone.tsx

import { useDropzone } from 'react-dropzone';
import { FileUp, Loader2 } from 'lucide-react';

import { usePdfUploader } from '@/hooks/usePdfUploader';
import { cn } from '@/lib/utils';

export const DropZone = () => {
  // ใช้ hook ที่มี Logic การอัปโหลดทั้งหมดอยู่แล้ว
  const { uploadPdfFiles, loading } = usePdfUploader();

  // useDropzone จะรับผิดชอบแค่การจัดการ event การลากและวางไฟล์
  // และเรียกใช้ฟังก์ชัน uploadPdfFiles ที่ได้มาจาก hook
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: uploadPdfFiles, // ส่งไฟล์ที่ drop ไปให้ hook จัดการ
    accept: { 'application/pdf': [] },
    multiple: true,
  });

  /* ---------- UI ---------- */
  return (
    <div
      {...getRootProps()}
      className={cn(
        'flex items-center justify-center cursor-pointer',
        'focus-visible:ring-2 focus-visible:ring-ring',
        loading && 'pointer-events-none' // ปิดการใช้งานเมื่อกำลังโหลด
      )}
    >
      <input {...getInputProps()} />

      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp />}
    </div>
  );
};

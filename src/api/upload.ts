// src\api\upload.ts
import type { UploadFileMeta } from '@/stores/filesStore';

/**
 * Upload PDF ไฟล์เข้า session ที่ระบุ
 * @param files   ไฟล์ PDF
 * @param chatId  ต้องระบุเสมอ (frontend จะสร้างให้อัตโนมัติถ้ายังไม่มี)
 */
export async function uploadFiles(files: File[], chatId: string) {
  if (!chatId) throw new Error('uploadFiles: chatId is required');

  const form = new FormData();
  files.forEach((f) => form.append('files', f));

  const res = await fetch(`http://localhost:8000/api/upload?chat_id=${chatId}`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) throw new Error(await res.text());

  return (await res.json()) as {
    message: string;
    files: UploadFileMeta[];
  };
}

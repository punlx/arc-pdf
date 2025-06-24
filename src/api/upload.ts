// src/api/upload.ts

import type { UploadFileMeta } from '@/stores/filesStore';
import { client } from './client';

/**
 * Upload PDF ไฟล์เข้า session ที่ระบุ
 * @param files   ไฟล์ PDF
 * @param chatId  ต้องระบุเสมอ (frontend จะสร้างให้อัตโนมัติถ้ายังไม่มี)
 */
export async function uploadFiles(files: File[], chatId: string) {
  if (!chatId) throw new Error('uploadFiles: chatId is required');

  const form = new FormData();
  files.forEach((f) => form.append('files', f));

  // ใช้ axios client และส่ง FormData
  // axios จะจัดการ baseURL และ Content-Type ที่ถูกต้องสำหรับ FormData โดยอัตโนมัติ
  const res = await client.post(`/api/upload?chat_id=${chatId}`, form);

  // axios จะ throw error เองถ้า status ไม่ใช่ 2xx ผ่าน interceptor
  // และ response จะอยู่ใน res.data
  return res.data as {
    message: string;
    files: UploadFileMeta[];
  };
}

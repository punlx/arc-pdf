import type { UploadFileMeta } from '@/stores/filesStore';
import { client } from './client';

export async function uploadFiles(files: File[], chatId: string) {
  if (!chatId) throw new Error('uploadFiles: chatId is required');

  const form = new FormData();
  files.forEach((f) => form.append('files', f));

  const res = await client.post(`/api/upload?chat_id=${chatId}`, form);

  return res.data as {
    message: string;
    files: UploadFileMeta[];
  };
}

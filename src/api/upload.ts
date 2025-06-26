import { client } from './client';
import { uploadResSchema } from './schemas'; // 👈 Import schema
import { z } from 'zod';

type UploadResponse = z.infer<typeof uploadResSchema>;

export async function uploadFiles(files: File[], chatId: string): Promise<UploadResponse> {
  if (!chatId) throw new Error('uploadFiles: chatId is required');

  const form = new FormData();
  files.forEach((f) => form.append('files', f));

  const res = await client.post(`/api/upload?chat_id=${chatId}`, form);

  return uploadResSchema.parse(res.data);
}

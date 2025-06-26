import { z } from 'zod';
import { client } from './client';

const uploadResSchema = z.object({
  message: z.string(),
  files: z.array(
    z.object({
      id: z.string(),
      filename: z.string(),
      size: z.number(),
      upload_time: z.string(),
    })
  ),
});
export type UploadResponse = z.infer<typeof uploadResSchema>;

export async function uploadFiles(files: File[], chatId: string): Promise<UploadResponse> {
  if (!chatId) throw new Error('uploadFiles: chatId is required');

  const form = new FormData();
  files.forEach((f) => form.append('files', f));

  const res = await client.post(`/api/upload?chat_id=${chatId}`, form);

  return uploadResSchema.parse(res.data);
}

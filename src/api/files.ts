import { client } from './client';
import { z } from 'zod';

const simpleMsgSchema = z.object({ message: z.string() });
export type SimpleMsg = z.infer<typeof simpleMsgSchema>;

const fileMetaSchema = z.object({
  id: z.string(),
  filename: z.string(),
  size: z.number(),
  upload_time: z.string(),
});
const filesResSchema = z.object({
  files: z.array(fileMetaSchema),
  total_files: z.number(),
  total_size_bytes: z.number(),
});
export type FilesResponseParsed = z.infer<typeof filesResSchema>;

export async function deleteFile(chatId: string, id: string): Promise<SimpleMsg> {
  const res = await client.delete(`/api/files/${id}`, {
    params: { chat_id: chatId },
  });
  return simpleMsgSchema.parse(res.data);
}

export async function deleteAllFiles(chatId: string): Promise<SimpleMsg> {
  const res = await client.delete('/api/files', {
    params: { chat_id: chatId },
  });
  return simpleMsgSchema.parse(res.data);
}

export async function fetchFiles(chatId: string): Promise<FilesResponseParsed> {
  const res = await client.get('/api/files', {
    params: { chat_id: chatId },
  });
  return filesResSchema.parse(res.data);
}

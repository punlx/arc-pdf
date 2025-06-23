// src/api/files.ts
import { client } from './client';

export async function deleteFile(chatId: string, id: string) {
  await client.delete(`/api/files/${id}`, { params: { chat_id: chatId } });
}

export async function deleteAllFiles(chatId: string) {
  await client.delete('/api/files', { params: { chat_id: chatId } });
}
export async function fetchFiles(chatId: string) {
  return client.get('/api/files', { params: { chat_id: chatId } });
}

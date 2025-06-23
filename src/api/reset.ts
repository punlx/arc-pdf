// src/api/reset.ts 
import { client } from './client';
import { z } from 'zod';

const resetReqSchema = z.object({ chat_id: z.string().uuid().optional() });
export type ResetRequest = z.infer<typeof resetReqSchema>;

const resetResSchema = z.object({
  message: z.string(),
  session_id: z.string().uuid(),
  chat_id: z.string().uuid().optional(),
});
export type ResetResponse = z.infer<typeof resetResSchema>;

/** รีเซ็ตเซสชันปัจจุบัน หรือส่ง {chat_id} เพื่อลบเฉพาะแชต */
export async function resetSession(body: ResetRequest = {}) {
  resetReqSchema.parse(body); // validate
  const res = await client.post('/api/reset', body);
  return resetResSchema.parse(res.data);
}

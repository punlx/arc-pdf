// src/api/chat.ts

import { z } from 'zod';
import { client } from './client';

export type ChatSummary = {
  chat_id: string;
  message_count: number;
  first_question?: string;
  last_message_time?: string;
};

/* ──────────────────── Zod Schemas ──────────────────── */

/** body ที่จะส่งเข้า /api/chat */
export const chatReqSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  chat_id: z.string().uuid().optional(),
});
export type ChatRequest = z.infer<typeof chatReqSchema>;

/** response ที่ backend จะคืนมา */
export const chatResSchema = z.object({
  answer: z.string(),
  source: z.string(),
  id: z.string().uuid(),
  timestamp: z.string(), // ISO-8601
  chat_id: z.string().uuid(),
});
export type ChatResponse = z.infer<typeof chatResSchema>;

/* ──────────────────── Helper ──────────────────── */

/**
 * POST /api/chat
 *
 * @param body        – payload (question, chat_id?)
 * @param opts.validateInput   – เปิด/ปิด validation request (default true)
 * @param opts.validateOutput  – เปิด/ปิด validation response (default true)
 *
 * @throws ZodError  – เมื่อ schema ไม่ผ่าน
 * @throws Error     – เมื่อ network หรือ server error
 */
export async function sendChat(
  body: ChatRequest,
  opts: { validateInput?: boolean; validateOutput?: boolean } = {}
): Promise<ChatResponse> {
  const { validateInput = true, validateOutput = true } = opts;

  /* 1) ตรวจ request */
  if (validateInput) chatReqSchema.parse(body);

  try {
    /* 2) ยิง API */
    const res = await client.post('/api/chat', body);

    /* 3) ตรวจ response */
    return validateOutput ? chatResSchema.parse(res.data) : (res.data as ChatResponse);
  } catch (err) {
    /* ── จัดการ Error ── */
    // ZodError เกิดจากการ parse ฝั่ง client ไม่ผ่าน (อาจเป็น request หรือ response)
    // เราต้อง re-throw เพื่อให้ UI นำไปจัดการต่อได้
    if (err instanceof z.ZodError) {
      throw err;
    }

    // Error อื่นๆ เช่น Network Error หรือ Server Error (4xx, 5xx)
    // จะถูกจัดการโดย axios interceptor ซึ่งจะแปลงเป็น Error object มาตรฐานให้แล้ว
    // ดังนั้นเราสามารถ throw ต่อไปได้เลย
    throw err as Error;
  }
}

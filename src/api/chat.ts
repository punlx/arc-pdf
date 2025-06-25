import { z } from 'zod';
import { client } from './client';

export type ChatSummary = {
  chat_id: string;
  message_count: number;
  first_question?: string;
  last_message_time?: string;
};

export const chatReqSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  chat_id: z.string().uuid().optional(),
});
export type ChatRequest = z.infer<typeof chatReqSchema>;

export const chatResSchema = z.object({
  answer: z.string(),
  source: z.string(),
  id: z.string().uuid(),
  timestamp: z.string(), // ISO-8601
  chat_id: z.string().uuid(),
});
export type ChatResponse = z.infer<typeof chatResSchema>;

export async function sendChat(
  body: ChatRequest,
  opts: { validateInput?: boolean; validateOutput?: boolean } = {}
): Promise<ChatResponse> {
  const { validateInput = true, validateOutput = true } = opts;

  if (validateInput) chatReqSchema.parse(body);

  try {
    const res = await client.post('/api/chat', body);

    return validateOutput ? chatResSchema.parse(res.data) : (res.data as ChatResponse);
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw err;
    }

    throw err as Error;
  }
}

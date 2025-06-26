import { z } from 'zod';

export const uploadFileMetaSchema = z.object({
  id: z.string().uuid(),
  filename: z.string(),
  size: z.number(),
  upload_time: z.string().datetime(),
});

export const sessionMetaSchema = z.object({
  chat_id: z.string().uuid(),
  message_count: z.number(),
  first_question: z.string().optional().nullable(),
  last_message_time: z.string().datetime().optional().nullable(),
});

export const sessionsListResSchema = z.object({
  chats: z.array(sessionMetaSchema),
});

const chatEntrySchema = z.object({
  id: z.string().uuid(),
  question: z.string(),
  answer: z.string(),
  source: z.string(),
  timestamp: z.string().datetime(),
  chat_id: z.string().uuid(),
});

export const chatHistoryResSchema = z.object({
  messages: z.array(chatEntrySchema),
});

export const createChatResSchema = z.object({
  chat_id: z.string().uuid(),
});

export const uploadResSchema = z.object({
  message: z.string(),
  files: z.array(uploadFileMetaSchema),
});

export const filesListResSchema = z.object({
  files: z.array(uploadFileMetaSchema),
  total_files: z.number(),
});

export const statusResSchema = z.object({
  has_memory: z.boolean(),
});

export const wsChunkSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('typing') }),
  z.object({ type: z.literal('chunk'), content: z.string() }),
  z.object({
    type: z.literal('complete'),
    answer: z.string(),
    source: z.string(),
    id: z.string().uuid(),
    chat_id: z.string().uuid(),
  }),
  z.object({ type: z.literal('error'), content: z.string() }),
]);

export type WSParsedChunk = z.infer<typeof wsChunkSchema>;

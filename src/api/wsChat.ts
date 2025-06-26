import { v4 as uuid } from 'uuid';
import { z } from 'zod';

const wsSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('typing'),
    content: z.string().optional(),
    message: z.string().optional(),
  }),
  z.object({
    type: z.literal('chunk'),
    content: z.string(),
    is_final: z.boolean().optional(),
  }),
  z.object({
    type: z.literal('complete'),
    id: z.string(),
    answer: z.string(),
    source: z.string().optional(),
    chat_id: z.string(),
    content: z.string().optional(),
  }),
  z.object({
    type: z.literal('error'),
    content: z.string().optional(),
    message: z.string().optional(),
  }),
]);
export type WSChunk = z.infer<typeof wsSchema>;

export type WSChunkTyping = Extract<WSChunk, { type: 'typing' }>;
export type WSChunkStream = Extract<WSChunk, { type: 'chunk' }>;
export type WSChunkComplete = Extract<WSChunk, { type: 'complete' }>;
export type WSChunkError = Extract<WSChunk, { type: 'error' }>;

type SendParams = {
  question: string;
  chat_id?: string | null;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';
const WS_URL = API_BASE_URL.replace(/^http/, 'ws') + '/api/ws/chat';

export const genTempId = () => uuid();

export function sendChatWS(
  params: SendParams,
  {
    onTyping,
    onChunk,
    onComplete,
    onError,
  }: {
    onTyping: () => void;
    onChunk: (text: string) => void;
    onComplete: (payload: WSChunkComplete) => void;
    onError: (msg: string) => void;
  }
) {
  const ws = new WebSocket(WS_URL);

  ws.addEventListener('open', () => {
    ws.send(
      JSON.stringify({
        question: params.question,
        chat_id: params.chat_id ?? undefined,
      })
    );
  });

  ws.addEventListener('message', (ev) => {
    let data: WSChunk;
    try {
      data = wsSchema.parse(JSON.parse(ev.data));
    } catch {
      onError('Invalid payload');
      ws.close();
      return;
    }

    switch (data.type) {
      case 'typing':
        onTyping();
        break;
      case 'chunk':
        onChunk(data.content ?? '');
        break;
      case 'complete':
        onComplete(data as WSChunkComplete);
        ws.close();
        break;
      case 'error':
        onError(data.content ?? data.message ?? 'Unknown error');
        ws.close();
        break;
      default:
        break;
    }
  });

  ws.addEventListener('error', () => {
    onError('WebSocket error');
  });

  return () => ws.close();
}

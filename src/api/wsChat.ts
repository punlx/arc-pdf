import { v4 as uuid } from 'uuid';
import { wsChunkSchema, type WSParsedChunk } from './schemas'; // 👈 Import schema และ type

export type WSChunk = {
  type: 'typing' | 'chunk' | 'complete' | 'error';
  content?: string;
  is_final?: boolean;
  answer?: string;
  source?: string;
  id?: string;
  chat_id?: string;
};

type SendParams = {
  question: string;
  chat_id?: string | null;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';
const WS_URL = API_BASE_URL.replace(/^http/, 'ws') + '/api/ws/chat';

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
    onComplete: (payload: WSParsedChunk) => void; // 👈 ใช้ type ที่ parse แล้ว
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
    try {
      const rawData = JSON.parse(ev.data);
      const data = wsChunkSchema.parse(rawData); // 👈 Validate ข้อมูล!

      switch (data.type) {
        case 'typing':
          onTyping();
          break;
        case 'chunk':
          onChunk(data.content);
          break;
        case 'complete':
          onComplete(data); // data ตอนนี้ type-safe แล้ว
          ws.close();
          break;
        case 'error':
          onError(data.content);
          ws.close();
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('WebSocket validation error or JSON parse error:', err);
      onError('Received invalid message format from server.');
      ws.close();
    }
  });

  ws.addEventListener('error', () => {
    onError('WebSocket error');
  });

  return () => ws.close();
}

export const genTempId = () => uuid();

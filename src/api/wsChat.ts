// src/api/wsChat.ts

import { v4 as uuid } from 'uuid';

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

// ✅ Step 1: อ่าน base URL จาก env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

// ✅ Step 2: แปลง http → ws / https → wss แบบปลอดภัย
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
    onComplete: (payload: WSChunk) => void;
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
    const data: WSChunk = JSON.parse(ev.data);

    switch (data.type) {
      case 'typing':
        onTyping();
        break;
      case 'chunk':
        onChunk(data.content ?? '');
        break;
      case 'complete':
        onComplete(data);
        ws.close();
        break;
      case 'error':
        onError(data.content ?? 'Unknown error');
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

export const genTempId = () => uuid();

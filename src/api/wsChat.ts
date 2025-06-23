// src/api/wsChat.ts
import { v4 as uuid } from 'uuid';

export type WSChunk = {
  type: 'typing' | 'chunk' | 'complete' | 'error';
  /** เนื้อหาของ chunk, หรือข้อความ error */
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
  const ws = new WebSocket('ws://localhost:8000/api/ws/chat');

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

  return () => ws.close(); // return disposer
}

/** สร้าง UUID สำหรับ placeholder bot message */
export const genTempId = () => uuid();

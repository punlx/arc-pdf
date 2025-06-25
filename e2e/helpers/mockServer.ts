// e2e/helpers/mockServer.ts
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

export const server = setupServer(
  // ✅ เพิ่ม Mock นี้เข้าไป
  http.post('http://localhost:8000/api/chat/create', () =>
    HttpResponse.json({ chat_id: 'mock-chat-id-123' })
  ),

  http.post('http://localhost:8000/api/upload', () =>
    HttpResponse.json({
      message: 'Uploaded',
      files: [
        { id: '1', filename: 'sample.pdf', size: 1234, upload_time: new Date().toISOString() },
      ],
    })
  ),

  http.post('http://localhost:8000/api/chat', () =>
    HttpResponse.json({
      answer: 'PDF about...',
      source: 'p.1',
      id: 'a',
      timestamp: new Date().toISOString(),
      chat_id: 'mock-chat-id-123',
    })
  )
);

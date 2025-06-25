// e2e/helpers/mockServer.ts
import { http, HttpResponse } from 'msw'; // <-- API ใหม่ v2
import { setupServer } from 'msw/node'; // <-- sub-path export เดิม

export const server = setupServer(
  http.post('http://localhost:8000/api/upload', () =>
    HttpResponse.json({
      message: 'Uploaded',
      files: [{ id: '1', filename: 'sample.pdf', size: 1234 }],
    })
  ),

  http.post('http://localhost:8000/api/chat', () =>
    HttpResponse.json({
      answer: 'PDF about...',
      source: 'p.1',
      id: 'a',
      timestamp: new Date().toISOString(),
      chat_id: 'c',
    })
  )
);

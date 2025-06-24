// src/App.tsx
import { Routes, Route } from 'react-router-dom';

import { AppShell } from '@/components/layout/AppShell';
import { HomePage } from './routes/HomePage';
import { ChatPage } from './routes/ChatPage';

export default function App() {
  return (
    <AppShell>
      <Routes>
        {/* หน้าหลัก (ไม่มี chatId) */}
        <Route path="/" element={<HomePage />} />
        {/* session ที่เลือก */}
        <Route path="/:chatId" element={<ChatPage />} />
      </Routes>
    </AppShell>
  );
}

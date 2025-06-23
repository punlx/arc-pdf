// src/App.tsx
import { Routes, Route } from 'react-router-dom';

import { AppShell } from '@/components/layout/AppShell';
import { ChatSessionPage } from '@/routes/ChatSessionPage';

export default function App() {
  return (
    <AppShell>
      <Routes>
        {/* หน้าหลัก (ไม่มี chatId) */}
        <Route path="/" element={<ChatSessionPage />} />
        {/* session ที่เลือก */}
        <Route path="/:chatId" element={<ChatSessionPage />} />
      </Routes>
    </AppShell>
  );
}

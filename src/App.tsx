import { Routes, Route } from 'react-router-dom';

import { AppShell } from '@/components/layout/AppShell';
import { HomePage } from './routes/HomePage';
import { ChatPage } from './routes/ChatPage';

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:chatId" element={<ChatPage />} />
      </Routes>
    </AppShell>
  );
}

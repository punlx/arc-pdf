// src/routes/ChatPage.tsx

import { ChatWindow } from '@/components/chat/ChatWindow';
import { InputBar } from '@/components/chat/InputBar';
import { useParams } from 'react-router-dom';

import { useFilesSync } from '@/hooks/useFilesSync';
// import { useSessionsSync } from '@/hooks/useSessionsSync'; // 🗑️ ลบ import นี้ออก
import { useChatHistory } from '@/hooks/useChatHistory';

export const ChatPage = () => {
  const { chatId } = useParams<{ chatId?: string }>();

  // 🗑️ ลบการเรียกใช้ useSessionsSync() ออกจากตรงนี้
  useFilesSync(chatId || null);
  useChatHistory(chatId);

  return (
    <div className="h-full pt-8 flex justify-center">
      <div className="transition-all max-sm:w-full max-md:w-[600px] max-lg:w-[600px] max-xl:w-[700px] max-2xl:w-[800px] 2xl:w-[900px]">
        <div className="max-sm:px-8">
          <ChatWindow />
        </div>
        <InputBar />
      </div>
    </div>
  );
};

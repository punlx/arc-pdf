// src\components\chat\ChatWindow.tsx

import { useRef, useEffect } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { MessageBubble } from './MessageBubble';

export const ChatWindow = () => {
  const messages = useChatStore((s) => s.messages);
  const bottomRef = useRef<HTMLDivElement>(null);

  /* auto-scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div
      className={`flex flex-col gap-3 pb-12 transition-all duration-700 ${
        messages.length ? ' min-h-[calc(100vh-260px)]' : ' min-h-[247px]'
      }`}
    >
      {messages.length ? (
        messages.map((m) => <MessageBubble key={m.id} m={m} />)
      ) : (
        <div className="text-center text-2xl pt-24">What do you want to know about this PDF?</div>
      )}
      <div ref={bottomRef} />
    </div>
  );
};

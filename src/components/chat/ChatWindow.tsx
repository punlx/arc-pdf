// src\components\chat\ChatWindow.tsx

import { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
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
    <ScrollArea className="flex-1 px-4 py-2 overflow-y-auto">
      <div className="flex flex-col gap-3">
        {messages.map((m) => (
          <MessageBubble key={m.id} m={m} />
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
};

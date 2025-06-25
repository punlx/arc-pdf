import { useRef, useEffect } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { MessageBubble } from './MessageBubble';

export const FirstChatText = `Let's explore PDF`;

export const ChatWindow = () => {
  const messages = useChatStore((s) => s.messages);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div
      className={`flex flex-col gap-6 pb-12 transition-all duration-700 ${
        messages.length ? ' min-h-[calc(100vh-247px)]' : ' min-h-[247px]'
      }`}
    >
      {messages.length ? (
        messages.map((m) => <MessageBubble key={m.id} m={m} />)
      ) : (
        <div className="text-center text-2xl pt-24">{FirstChatText}</div>
      )}
      <div ref={bottomRef} />
    </div>
  );
};

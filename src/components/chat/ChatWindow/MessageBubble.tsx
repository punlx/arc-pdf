// src/components/chat/MessageBubble.tsx

import clsx from 'clsx';
import { Clipboard } from 'lucide-react';
import { type Message } from '@/stores/chatStore';

export const MessageBubble = ({ m }: { m: Message }) => {
  const isUser = m.role === 'user';
  const isTyping = m.text === '...';

  return (
    <div
      // 🆕 เพิ่ม data-testid
      data-testid="message-bubble"
      className={clsx(
        'max-w-[90%] max-sm:max-w-[95%] rounded-md p-4 text-sm',
        isUser ? 'ml-auto bg-primary text-primary-foreground' : 'mr-auto bg-muted'
      )}
    >
      <p className="whitespace-pre-line text-[16px]">
        {isTyping ? <span className="animate-pulse">Thinking...</span> : m.text}
      </p>

      {m.source && !isUser && !isTyping && (
        <div
          data-testid="message-source"
          className="mt-1 flex items-center gap-1 text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap w-full"
        >
          <Clipboard className="h-3 w-3 shrink-0" />
          <span className="overflow-hidden text-ellipsis whitespace-nowrap">{m.source}</span>
        </div>
      )}
    </div>
  );
};

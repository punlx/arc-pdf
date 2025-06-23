// src\components\MessageBubble.tsx

import clsx from 'clsx';
import { Clipboard } from 'lucide-react';
import { type Message } from '@/stores/chatStore';

export const MessageBubble = ({ m }: { m: Message }) => {
  const isUser = m.role === 'user';
  const isTyping = m.text === '...';

  return (
    <div
      className={clsx(
        'max-w-[75%] rounded-md p-3 text-sm',
        isUser ? 'ml-auto bg-primary text-primary-foreground' : 'mr-auto bg-muted'
      )}
    >
      <p className="whitespace-pre-line">
        {isTyping ? <span className="animate-pulse">กำลังโหลด…</span> : m.text}
      </p>

      {m.source && !isUser && !isTyping && (
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Clipboard className="h-3 w-3" /> {m.source}
        </div>
      )}
    </div>
  );
};

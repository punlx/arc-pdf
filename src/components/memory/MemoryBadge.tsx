import { Badge } from '@/components/ui/badge';
import { Database } from 'lucide-react';
import { useSessionsStore } from '@/stores/sessionsStore';
import { useChatStore } from '@/stores/chatStore';

export const MemoryBadge = () => {
  const chatId = useChatStore((s) => s.chatId);
  const hasMemory = useSessionsStore(
    (s) => s.sessions.find((session) => session.chat_id === chatId)?.has_memory
  );

  return hasMemory ? (
    <Badge className="bg-green-600 hover:bg-green-600 items-center flex gap-2 text-white">
      <Database />
      <span>Memory</span>
    </Badge>
  ) : (
    <Badge variant="outline">No Memory</Badge>
  );
};

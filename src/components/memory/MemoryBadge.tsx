import { useChatStore } from '@/stores/chatStore';
import { Badge } from '@/components/ui/badge';
import { Database } from 'lucide-react';

export const MemoryBadge = () => {
  const hasMemory = useChatStore((s) => s.hasMemory);

  return hasMemory ? (
    <Badge className="bg-green-600 hover:bg-green-600 items-center flex gap-2 text-white">
      <Database />
      <span>Memory</span>
    </Badge>
  ) : (
    <Badge variant="outline">No Memory</Badge>
  );
};

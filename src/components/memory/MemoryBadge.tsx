// src\components\MemoryBadge.tsx

import { useChatStore } from '@/stores/chatStore';
import { Badge } from '@/components/ui/badge';

export const MemoryBadge = () => {
  const hasMemory = useChatStore((s) => s.hasMemory);

  return hasMemory ? (
    <Badge className="bg-green-600 hover:bg-green-600">Memory ✓</Badge>
  ) : (
    <Badge variant="outline">No Memory</Badge>
  );
};

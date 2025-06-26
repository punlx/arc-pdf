import { useEffect } from 'react';
import { toast } from 'sonner';

import { client } from '@/api/client';
import { sessionsListResSchema } from '@/api/schemas';
import { useSessionsStore } from '@/stores/sessionsStore';

export function useSessionsSync() {
  const setSessions = useSessionsStore((s) => s.setSessions);

  useEffect(() => {
    (async () => {
      try {
        const res = await client.get('/api/chat');
        const validatedData = sessionsListResSchema.parse(res.data);

        setSessions(validatedData.chats);
      } catch (err) {
        console.error('Failed to fetch or validate sessions:', err);
        toast.error('Could not load chat sessions. Please try refreshing the page.');
      }
    })();
  }, [setSessions]);
}

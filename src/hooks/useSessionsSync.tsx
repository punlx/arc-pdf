import { useEffect } from 'react';

import { client } from '@/api/client';
import { useSessionsStore } from '@/stores/sessionsStore';

export function useSessionsSync() {
  const setSessions = useSessionsStore((s) => s.setSessions);

  useEffect(() => {
    (async () => {
      try {
        const res = await client.get('/api/chat');
        setSessions(res.data.chats);
      } catch {}
    })();
  }, [setSessions]);
}

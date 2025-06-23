// src\hooks\useStatus.tsx

import { useEffect } from 'react';
import { useChatStore } from '@/stores/chatStore';

export const useStatus = () => {
  const setMemory = useChatStore((s) => s.setMemory);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/status');
        const data = await res.json();
        setMemory(data.has_memory);
      } catch (e) {
        console.error(e);
      }
    };
    fetchStatus();
  }, [setMemory]);
};

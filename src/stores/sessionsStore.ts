// src/stores/sessionsStore.ts

import { create } from 'zustand';
import { deduplicateByKey } from '@/lib/utils';

export interface SessionMeta {
  chat_id: string;
  message_count: number;
  first_question?: string;
  last_message_time?: string;
}

interface SessionsState {
  sessions: SessionMeta[];

  setSessions: (ss: SessionMeta[]) => void;
  addSession: (s: SessionMeta) => void;
  removeSession: (id: string) => void;
  bringToFront: (id: string) => void;
  clear: () => void;
}

const dedupSessions = (sessions: SessionMeta[]) => deduplicateByKey(sessions, 'chat_id');

export const useSessionsStore = create<SessionsState>((set) => ({
  sessions: [],

  /* รับจาก backend → เก็บเฉพาะที่มีข้อความแล้ว */
  setSessions: (incoming) =>
    set(() => ({
      sessions: dedupSessions(incoming.filter((s) => s.message_count > 0)),
    })),

  /* ใส่เข้ามือเมื่อมี Q/A รอบแรกเสร็จ */
  addSession: (s) =>
    set((state) => ({
      sessions: dedupSessions([s, ...state.sessions]),
    })),

  removeSession: (id) =>
    set((state) => ({
      sessions: state.sessions.filter((s) => s.chat_id !== id),
    })),

  bringToFront: (id) =>
    set((state) => {
      const idx = state.sessions.findIndex((s) => s.chat_id === id);
      if (idx === -1) return {};
      const target = state.sessions[idx];
      const rest = state.sessions.filter((_, i) => i !== idx);
      return { sessions: [target, ...rest] };
    }),

  clear: () => set({ sessions: [] }),
}));

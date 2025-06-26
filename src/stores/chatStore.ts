import { create } from 'zustand';
import * as Sentry from '@sentry/react'; // ── Sentry

export interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  source?: string;
}

type Patch = Partial<Message> | ((prev: Message) => Partial<Message>);

export interface ChatState {
  chatId: string | null;
  messages: Message[];
  hasMemory: boolean;
  sending: boolean;

  addMessage: (m: Message) => void;
  updateMessage: (id: string, patch: Patch) => void;
  setMessages: (ms: Message[]) => void;
  setChatId: (id: string | null) => void;
  setMemory: (f: boolean) => void;
  setSending: (v: boolean) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  chatId: null,
  messages: [],
  hasMemory: false,
  sending: false,

  addMessage: (m) =>
    set((s) => ({
      messages: [...s.messages, m],
    })),

  updateMessage: (id, patch) =>
    set((s) => ({
      messages: s.messages.map((m) => {
        if (m.id !== id) return m;
        const partial = typeof patch === 'function' ? patch(m) : patch;
        return { ...m, ...partial };
      }),
    })),

  setMessages: (ms) => set({ messages: ms }),

  /* ───────────── setChatId พร้อม Sentry context ───────────── */
  setChatId: (id) => {
    /* แสดงใน Issue context เพื่อค้นหาเจอง่าย */
    if (id) {
      Sentry.setContext('chat', { chat_id: id }); // ── Sentry
    } else {
      Sentry.setContext('chat', null); // clear เมื่อ reset
    }
    set({ chatId: id });
  },

  setMemory: (f) => set({ hasMemory: f }),
  setSending: (v) => set({ sending: v }),

  reset: () =>
    set(() => {
      /* ล้าง context เมื่อผู้ใช้ reset */
      Sentry.setContext('chat', null); // ── Sentry
      return {
        chatId: null,
        messages: [],
        hasMemory: false,
        sending: false,
      };
    }),
}));

// src/stores/configStore.ts
import { create } from 'zustand';

export interface ConfigState {
  useStream: boolean;
  setUseStream: (v: boolean) => void;
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  useStream: true,
  setUseStream: (v) => {
    // ป้องกัน set ซ้ำซ้อน
    if (v !== get().useStream) set({ useStream: v });
  },
}));

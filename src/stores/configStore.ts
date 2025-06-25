import { create } from 'zustand';

export interface ConfigState {
  useStream: boolean;
  setUseStream: (v: boolean) => void;
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  useStream: true,
  setUseStream: (v) => {
    if (v !== get().useStream) set({ useStream: v });
  },
}));

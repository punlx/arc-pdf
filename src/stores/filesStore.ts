// src/stores/filesStore.ts

import { create } from 'zustand';
import { deduplicateByKey } from '@/lib/utils';

export interface UploadFileMeta {
  id: string;
  filename: string;
  size: number;
  upload_time: string;
}

export interface FilesState {
  files: UploadFileMeta[];
  setFiles: (fs: UploadFileMeta[]) => void;
  addMany: (fs: UploadFileMeta[]) => void;
  deleteById: (id: string) => void;
  clear: () => void;
}

const dedupFiles = (files: UploadFileMeta[]) =>
  deduplicateByKey(files, 'filename', (name) => name.toLowerCase());

export const useFilesStore = create<FilesState>((set) => ({
  files: [],

  setFiles: (
    fs // แทนที่ทั้งก้อน
  ) => set({ files: dedupFiles(fs) }),

  addMany: (
    fs // เติมเข้า list เดิม
  ) => set((s) => ({ files: dedupFiles([...s.files, ...fs]) })),

  deleteById: (id) => set((s) => ({ files: s.files.filter((f) => f.id !== id) })),

  clear: () => set({ files: [] }),
}));

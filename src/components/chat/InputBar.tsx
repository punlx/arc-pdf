// src/components/chat/InputBar.tsx

import { type FormEvent, useState } from 'react';
import { SendHorizonal, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useChatStore } from '@/stores/chatStore';
import { useFilesStore } from '@/stores/filesStore';
import { useChatSubmit } from '@/hooks/useChatSubmit';
import { UploadPanel } from '../upload/UploadPanel';

export const InputBar = () => {
  const [text, setText] = useState('');
  const messages = useChatStore((s) => s.messages);
  const hasFiles = useFilesStore((s) => s.files.length > 0);

  // ใช้ hook ที่จัดการ Logic การส่งทั้งหมด
  const { isSubmitting, submitChat } = useChatSubmit();

  // handleSubmit ฟังก์ชันจะเรียบง่ายและสะอาดขึ้นมาก
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = text.trim();
    if (!q || isSubmitting) return;

    setText(''); // เคลียร์ input ทันที
    await submitChat(q);
  }

  /* ──────────── UI ──────────── */
  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-center gap-2 sticky bottom-8 z-50 bg-background transition-all ${
        messages.length ? '0' : '0'
      }`}
    >
      <div className="w-full p-4 border-2 rounded-4xl flex flex-col gap-4 ">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask anything..."
          className="border-none focus-visible:shadow-none"
          disabled={isSubmitting} // ใช้ isSubmitting จาก hook
        />
        <div className="flex justify-between gap-3">
          <UploadPanel></UploadPanel>

          <Button
            className="cursor-pointer"
            type="submit"
            variant={'outline'}
            disabled={isSubmitting || !text.trim() || !hasFiles}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <SendHorizonal className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

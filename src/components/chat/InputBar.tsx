import { type FormEvent, useState } from 'react';
import { SendHorizonal, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useChatStore } from '@/stores/chatStore';
import { useFilesStore } from '@/stores/filesStore';
import { useChatSubmit } from '@/hooks/chat/useChatSubmit';
import { UploadPanel } from '../upload/UploadPanel';

export const InputBar = () => {
  const [text, setText] = useState('');
  const messages = useChatStore((s) => s.messages);
  const hasFiles = useFilesStore((s) => s.files.length > 0);

  const { isSubmitting, submitChat } = useChatSubmit();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = text.trim();
    if (!q || isSubmitting) return;

    setText('');
    await submitChat(q);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-center gap-2 sticky max-sm:bottom-0 bottom-8 z-50 bg-background transition-all ${
        messages.length ? '0' : '0'
      }`}
    >
      <div
        className={`w-full p-4 border-2 sm:rounded-4xl ${
          messages.length ? 'max-sm:rounded-t-4xl' : 'rounded-4xl'
        } flex flex-col gap-4`}
      >
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask anything..."
          className="border-none focus-visible:shadow-none text-[16px]"
          disabled={isSubmitting}
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
              // 🆕 เพิ่ม data-testid
              <Loader2 className="animate-spin h-4 w-4" data-testid="loader-icon" />
            ) : (
              // 🆕 เพิ่ม data-testid
              <SendHorizonal className="h-4 w-4" data-testid="send-icon" />
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

// src\components\upload\UploadPanel.tsx
import { DropZone } from './DropZone';
import { FileList } from './FileList';
import { Button } from '@/components/ui/button';
import { useFilesStore } from '@/stores/filesStore';
import { useChatStore } from '@/stores/chatStore'; // 🆕
import { deleteAllFiles } from '@/api/files';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface UploadPanelProps {
  compact?: boolean;
}

export const UploadPanel = ({ compact = false }: UploadPanelProps) => {
  const files = useFilesStore((s) => s.files);
  const clear = useFilesStore((s) => s.clear);

  const chatId = useChatStore((s) => s.chatId); // 🆕

  async function handleDeleteAll() {
    if (!files.length || !chatId) return;

    if (!window.confirm('ลบไฟล์ทั้งหมด?')) return;

    try {
      await deleteAllFiles(chatId); // 🆕 ส่ง chatId
      clear();
      toast.success('ลบไฟล์ทั้งหมดแล้ว');
    } catch (err: any) {
      toast.error(err?.message ?? 'ลบไฟล์ไม่สำเร็จ');
    }
  }

  return (
    <div
      className={cn(
        compact ? 'w-full max-w-sm h-full' : 'w-md border-r h-[calc(100vh-56px)]',
        'p-4 overflow-auto'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-medium">อัปโหลด PDF</h2>
      </div>

      <DropZone />

      <div className="flex justify-end w-full pr-4 mt-6">
        {files.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteAll}
            aria-label="delete all files"
          >
            Delete All
          </Button>
        )}
      </div>

      <FileList />
    </div>
  );
};

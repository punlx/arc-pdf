// src/components/upload/FileList.tsx
import { useFilesStore } from '@/stores/filesStore';
import { FileText, Trash } from 'lucide-react'; // 🆕
import { ScrollArea } from '@/components/ui/scroll-area';
import { deleteFile } from '@/api/files'; // 🆕
import { toast } from 'sonner'; // 🆕
import { useChatStore } from '@/stores/chatStore';

export const FileList = () => {
  const chatId = useChatStore((s) => s.chatId);
  const files = useFilesStore((s) => s.files);
  const deleteById = useFilesStore((s) => s.deleteById); // 🆕

  if (!files.length)
    return <p className="text-muted-foreground text-sm mt-4">ยังไม่มีไฟล์ที่อัปโหลด</p>;

  async function handleRemove(id: string) {
    try {
      if (!chatId) throw new Error('No chat');
      await deleteFile(chatId, id);
      deleteById(id);
      toast.success('ไฟล์ถูกลบ');
    } catch (err: any) {
      toast.error(err.message ?? 'ลบไฟล์ไม่สำเร็จ');
    }
  }

  return (
    <ScrollArea className="h-48 mt-4 pr-2">
      <ul className="space-y-2">
        {files.map((f) => (
          <li key={f.id} className="flex items-center gap-2 text-sm border rounded-md px-3 py-2">
            <FileText className="h-4 w-4 text-primary shrink-0" />
            <span className="flex-1 truncate">{f.filename}</span>
            <span className="text-xs text-muted-foreground mr-2 shrink-0">
              {(f.size / 1024).toFixed(1)} KB
            </span>

            {/* ปุ่มลบรายไฟล์ */}
            <button
              onClick={() => handleRemove(f.id)}
              aria-label="delete file"
              className="hover:text-destructive transition shrink-0"
            >
              <Trash className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
};

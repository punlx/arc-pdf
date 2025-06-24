// src/components/upload/FileList.tsx
import { useFilesStore } from '@/stores/filesStore';
import { FileText } from 'lucide-react'; // 🆕 เพิ่ม Trash
import { ScrollArea } from '@/components/ui/scroll-area';

export const FileList = () => {
  const files = useFilesStore((s) => s.files);

  if (!files.length)
    return <p className="text-muted-foreground text-sm mt-4">ยังไม่มีไฟล์ที่อัปโหลด</p>;

  return (
    <ScrollArea className="h-52">
      <ul className="space-y-2">
        {files.map((f) => (
          <li key={f.id} className="flex items-center gap-2 text-sm border rounded-md px-3 py-2">
            <FileText className="h-4 w-4 text-primary shrink-0" />
            <span className="flex-1 truncate">{f.filename}</span>
            <span className="text-xs text-muted-foreground mr-2 shrink-0">
              {(f.size / 1024).toFixed(1)} KB
            </span>
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
};

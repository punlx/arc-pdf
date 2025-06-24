import { DropZone } from './DropZone';
import { FileList } from './FileList';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useFilesStore } from '@/stores/filesStore';
import { useChatStore } from '@/stores/chatStore';
import { deleteAllFiles } from '@/api/files';
import { toast } from 'sonner';
import { cn } from '@/lib/utils'; // 🆕 tiny util for merging classes

export const UploadPanel = () => {
  const files = useFilesStore((s) => s.files);
  const clear = useFilesStore((s) => s.clear);
  const chatId = useChatStore((s) => s.chatId);

  /* ---------- helper ---------- */
  const visibleFiles = files.slice(0, 3); // โชว์ได้สูงสุด 3 ชิ้น
  const hiddenCount = Math.max(files.length - 3, 0); // ที่เหลือ

  async function handleDeleteAll() {
    if (!files.length || !chatId) return;
    if (!window.confirm('ลบไฟล์ทั้งหมด?')) return;

    try {
      await deleteAllFiles(chatId);
      clear();
      toast.success('ลบไฟล์ทั้งหมดแล้ว');
    } catch (err: any) {
      toast.error(err?.message ?? 'ลบไฟล์ไม่สำเร็จ');
    }
  }

  return (
    <>
      <div className={cn('flex items-center gap-3 w-full overflow-hidden')}>
        <DropZone />
        {/* 1️⃣ icon อัปโหลด  */}

        {/* 2️⃣ แท็กไฟล์แนวนอน (scroll ได้บน mobile) */}
        <div className="flex items-center gap-2 w-full">
          <div className="w-full flex gap-2">
            {visibleFiles.map((f) => (
              <div
                key={f.id}
                title={f.filename}
                className="bg-primary text-white truncate text-xs font-normal px-3 py-1 rounded-full"
              >
                {f.filename}
              </div>
            ))}
          </div>

          {/* 3️⃣  +n (ถ้ามีไฟล์เกิน 3) */}
        </div>
      </div>
      {hiddenCount > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Badge
              variant="outline"
              className="cursor-pointer px-2 py-1 text-xs font-medium shrink-0"
            >
              +{hiddenCount}
            </Badge>
          </PopoverTrigger>

          <PopoverContent side="top" align="start" className="w-72 flex flex-col gap-4">
            <header className="flex justify-between items-center">
              <span className="font-medium text-sm">All files</span>

              {files.length > 0 && (
                <Button size="sm" variant="destructive" onClick={handleDeleteAll}>
                  Delete all
                </Button>
              )}
            </header>
            <FileList /> {/* ใช้คอมโพเนนต์เก่าได้เลย */}
          </PopoverContent>
        </Popover>
      )}
    </>
  );
};

// src/components/upload/UploadPanel.tsx
import { useLayoutEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useFilesStore } from '@/stores/filesStore';
import { cn } from '@/lib/utils';
import { FileList } from './FileList';
import { DropZone } from './DropZone';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

/* ---------- ชนิดข้อมูลไฟล์ ---------- */
interface FileMeta {
  id: string;
  filename: string;
  size: number;
}

const GAP_PX = 8; // gap-2 = 0.5rem

export const UploadPanel = () => {
  /* ---------- store ---------- */
  const files = useFilesStore((s) => s.files) as FileMeta[];

  /* ---------- state ---------- */
  const [tagWidths, setTagWidths] = useState<Record<string, number>>({});
  const [visibleCount, setVisibleCount] = useState<number>(files.length);

  /* ---------- refs ---------- */
  const containerRef = useRef<HTMLDivElement | null>(null);
  const badgeRef = useRef<HTMLSpanElement | null>(null);

  /* ---------- helper : เก็บความกว้างแท็กหลัง mount ---------- */
  const registerTag = (id: string, el: HTMLDivElement | null) => {
    if (el && !(id in tagWidths)) {
      setTagWidths((w) => ({ ...w, [id]: el.offsetWidth }));
    }
  };

  /* ---------- recalc เมื่อขนาดเปลี่ยน + วัดครบแล้ว ---------- */
  useLayoutEffect(() => {
    if (!containerRef.current) return;

    // ถ้า tag ไหนยังไม่ได้วัด → แสดงทุกไฟล์ไปก่อน
    const allMeasured = files.every((f) => tagWidths[f.id]);
    if (!allMeasured) {
      setVisibleCount(files.length);
      return;
    }

    const calc = () => {
      const containerWidth = containerRef.current!.offsetWidth;
      const badgeWidth = badgeRef.current ? badgeRef.current.offsetWidth : 0;
      const free = containerWidth - badgeWidth;

      let used = 0;
      let count = 0;
      for (const f of files) {
        const w = tagWidths[f.id];
        if (used + w <= free) {
          used += w + GAP_PX;
          count += 1;
        } else {
          break;
        }
      }
      setVisibleCount(count);
    };

    calc(); // run ครั้งแรก
    const ro = new ResizeObserver(calc);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [files, tagWidths]);

  /* ---------- derive ---------- */
  const visibleFiles = files.slice(0, visibleCount);
  const hiddenCount = Math.max(files.length - visibleCount, 0);

  /* ---------- UI ---------- */
  return (
    <div className={cn('flex items-center gap-3 w-full overflow-hidden')}>
      {/* 1️⃣ icon อัปโหลด */}
      <DropZone />

      {/* 2️⃣ container แท็ก – ให้ flex-1 เพื่อกางเต็มพื้นที่ที่เหลือ */}
      <div ref={containerRef} className="flex-1 flex items-center gap-2 overflow-hidden pr-[37px]">
        {visibleFiles.map((f) => (
          <Tooltip key={f.id}>
            <TooltipTrigger asChild>
              <div
                ref={(el) => registerTag(f.id, el)}
                className="bg-background max-w-[260px] border-3 text-foreground truncate text-xs font-normal px-3 py-1 rounded-full"
              >
                {f.filename}
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">{f.filename}</TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* 3️⃣  +n (ถ้ามีไฟล์เกินพื้นที่) */}
      {hiddenCount > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Badge
              ref={badgeRef}
              variant="outline"
              className="border-3 cursor-pointer px-2 py-2 text-xs font-medium shrink-0"
            >
              +{hiddenCount}
            </Badge>
          </PopoverTrigger>

          <PopoverContent side="top" align="center" className="w-90 flex flex-col gap-4">
            <header className="flex justify-between items-center">
              <span className="font-medium text-sm">All files ({files.length})</span>
            </header>
            <FileList />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

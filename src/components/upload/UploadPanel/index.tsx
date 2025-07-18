import { useLayoutEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/useMobile';
import { useFilesStore } from '@/stores/filesStore';
import { cn } from '@/lib/utils';
import { FileList } from './FileList';
import { DropZone } from './DropZone';

/* ---------- ชนิดข้อมูลไฟล์ ---------- */
interface FileMeta {
  id: string;
  filename: string;
  size: number;
}

const GAP_PX = 8; // gap-2 = 0.5rem

export const UploadPanel = () => {
  const files = useFilesStore((s) => s.files) as FileMeta[];

  const [tagWidths, setTagWidths] = useState<Record<string, number>>({});
  const [visibleCount, setVisibleCount] = useState<number>(files.length);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const badgeRef = useRef<HTMLSpanElement | null>(null);

  const registerTag = (id: string, el: HTMLDivElement | null) => {
    if (el && !(id in tagWidths)) {
      setTagWidths((w) => ({ ...w, [id]: el.offsetWidth }));
    }
  };

  useLayoutEffect(() => {
    if (!containerRef.current) return;

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

    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [files, tagWidths]);

  const visibleFiles = files.slice(0, visibleCount);
  const hiddenCount = Math.max(files.length - visibleCount, 0);

  const isMobileScreen = useIsMobile();

  return (
    <div className={cn('flex items-center gap-3 w-full overflow-hidden')}>
      <DropZone />

      <div ref={containerRef} className="flex-1 flex items-center gap-2 overflow-hidden pr-[37px]">
        {visibleFiles.map((f) => (
          <Tooltip key={f.id}>
            <TooltipTrigger asChild>
              <div
                ref={(el) => registerTag(f.id, el)}
                className="bg-background max-w-[260px] min-w-[100px] border-3 text-foreground truncate text-xs font-normal px-3 py-1 rounded-full"
              >
                {f.filename}
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">{f.filename}</TooltipContent>
          </Tooltip>
        ))}
      </div>

      {hiddenCount > 0 &&
        (isMobileScreen ? (
          <Sheet>
            <SheetTrigger asChild>
              <Badge
                ref={badgeRef}
                variant="outline"
                className="border-3 cursor-pointer px-2 py-2 text-xs font-medium shrink-0"
              >
                +{hiddenCount}
              </Badge>
            </SheetTrigger>

            <SheetContent
              side="bottom"
              className="w-full gap-0 max-w-none rounded-t-2xl border-t-2 shadow-lg bg-background"
            >
              <SheetHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <SheetTitle>All files ({files.length})</SheetTitle>
                </div>
                <SheetClose asChild />
              </SheetHeader>

              <FileList />
            </SheetContent>
          </Sheet>
        ) : (
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
        ))}
    </div>
  );
};

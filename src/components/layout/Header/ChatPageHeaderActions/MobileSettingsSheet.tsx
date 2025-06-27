import { Settings, MessageSquare, Glasses } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ThemeSelect } from '@/components/layout/Header/ChatPageHeaderActions/ThemeSelect';
import { StreamModeToggle } from './StreamModeToggle'; // 🚀 ใช้ Component ที่สร้างใหม่

export const MobileSettingsSheet = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="ghost" aria-label="settings" className="rounded-full">
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="top"
        className="w-full max-w-none rounded-b-2xl border-b-2 shadow-lg bg-background"
      >
        <SheetHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings />
            <SheetTitle>Settings</SheetTitle>
          </div>
        </SheetHeader>
        <div className="flex flex-col gap-2 px-5 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Streaming</span>
            </div>
            <StreamModeToggle /> {/* 🚀 ใช้ Component ที่สร้างใหม่ */}
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Glasses className="h-4 w-4" />
              <span className="text-sm">Theme</span>
            </div>
            <ThemeSelect />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

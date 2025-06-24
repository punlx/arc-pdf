// src/components/layout/Header.tsx

import { useLocation } from 'react-router-dom';
import { useSidebar } from '../../ui/sidebar';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { ChatPageHeaderActions } from './ChatPageHeaderActions'; // 🚀 Import component ใหม่

export const Header = () => {
  const { open, openMobile } = useSidebar();
  const isCollapsed = useSidebar().isMobile ? !openMobile : !open;
  const location = useLocation();

  return (
    <header
      className={`${
        !isCollapsed ? 'pl-4' : 'pl-14'
      } pr-4 h-[60px] flex items-center justify-between w-full border-b-2 sticky top-0 bg-background z-20 transition-all`}
    >
      <div className="text-xl font-medium">ArcPDF</div>

      <div className="flex items-center gap-4">
        {location.pathname === '/' ? (
          // Actions สำหรับหน้า Home
          <ThemeToggle />
        ) : (
          // Actions สำหรับหน้า Chat
          <ChatPageHeaderActions />
        )}
      </div>
    </header>
  );
};

// src/components/sessions/SessionsSidebar.tsx

import { Plus, Ellipsis, Trash, File } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fullReset } from '@/lib/fullReset';
import { Button } from '@/components/ui/button';
import { useSessionsStore, type SessionMeta } from '@/stores/sessionsStore';
import { useChatStore } from '@/stores/chatStore';
import { useFilesStore } from '@/stores/filesStore';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Separator } from '@/components/ui/separator';
import LogoImg from '@/assets/logo.png';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '../ui/scroll-area';

// ========================================================================
//  "Dumb" Components (ส่วนแสดงผล)
// ========================================================================

const NewChatButton = ({ onClick }: { onClick: () => void }) => (
  <Button
    onClick={onClick}
    variant="ghost"
    className="w-full border border-white flex gap-1 justify-center items-center rounded-full py-2 cursor-pointer"
    type="button"
  >
    <Plus />
    <span>New Chat</span>
  </Button>
);

const SessionListItem = ({
  session,
  onSelect,
  onDelete,
}: {
  session: SessionMeta;
  onSelect: () => void;
  onDelete: () => void;
}) => {
  const labelText = session.first_question?.trim();
  const messageCount = session.message_count;
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 flex-1 min-w-0" onClick={onSelect}>
            <span className="flex-1 min-w-0 truncate">{labelText}</span>
            <Badge variant="default">{messageCount}</Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Ellipsis />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-0">
              <DropdownMenuItem className="flex justify-between" onClick={onDelete}>
                <Trash />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const SessionList = ({
  sessions,
  onSelectSession,
  onDeleteSession,
}: {
  sessions: SessionMeta[];
  onSelectSession: (chatId: string) => void;
  onDeleteSession: (chatId: string) => void;
}) => {
  if (sessions.length === 0) {
    return (
      <p className="flex items-center gap-3 opacity-60">
        <File />
        <span>No sessions yet</span>
      </p>
    );
  }

  return (
    <SidebarMenu>
      {sessions.map((s) => (
        <SessionListItem
          key={s.chat_id}
          session={s}
          onSelect={() => onSelectSession(s.chat_id)}
          onDelete={() => onDeleteSession(s.chat_id)}
        />
      ))}
    </SidebarMenu>
  );
};

// ========================================================================
// "Smart" Component (ส่วนจัดการ Logic)
// ========================================================================

const SidebarOpenTrigger = () => {
  const { isMobile, open, openMobile } = useSidebar();
  const isClosed = isMobile ? !openMobile : !open;
  return isClosed ? (
    <div className="fixed top-2 left-2 z-50">
      <SidebarTrigger className="cursor-pointer" />
    </div>
  ) : null;
};

const SidebarLayout = ({ children }: { children: ReactNode }) => {
  const { sessions, bringToFront } = useSessionsStore();
  const resetChat = useChatStore((s) => s.reset);
  const clearFiles = useFilesStore((s) => s.clear);
  const navigate = useNavigate();
  const { isMobile, setOpenMobile } = useSidebar();

  const handleNewChat = () => {
    resetChat();
    clearFiles();
    document.title = 'ArcPDF'; // 🆕 รีเซ็ตชื่อแท็บ
    navigate('/');
    if (isMobile && typeof setOpenMobile === 'function') {
      setOpenMobile(false);
    }
  };

  const handleSelectSession = (chatId: string) => {
    bringToFront(chatId);

    // 🆕 ค้นหา session ที่เลือกเพื่อเอา first_question
    const selectedSession = sessions.find((s) => s.chat_id === chatId);
    if (selectedSession?.first_question) {
      document.title = `ArcPDF - ${selectedSession.first_question}`;
    } else {
      document.title = 'ArcPDF'; // ชื่อสำรอง
    }

    navigate(`/${chatId}`);
    if (isMobile && typeof setOpenMobile === 'function') {
      setOpenMobile(false);
    }
  };

  const handleDeleteSession = (chatId: string) => {
    if (window.confirm('ลบแชตนี้ทั้งหมด ?')) {
      fullReset(chatId, navigate);
      document.title = 'ArcPDF'; // 🆕 รีเซ็ตชื่อแท็บ
    }
  };

  return (
    <>
      <SidebarOpenTrigger />
      <Sidebar collapsible="offcanvas">
        <div className="flex flex-col gap-6 h-full">
          <SidebarHeader className="items-center justify-between pt-4">
            <img src={LogoImg} width={128} alt="Logo" className="ml-3" />
            <SidebarTrigger className="cursor-pointer" />
          </SidebarHeader>
          <SidebarContent className="flex-none px-4">
            <NewChatButton onClick={handleNewChat} />
          </SidebarContent>
          <SidebarContent className="pl-4">
            <ScrollArea className="h-full w-full pr-4">
              <div className="opacity-60 mb-3">Chats</div>
              <Separator className="mb-4" />
              <SessionList
                sessions={sessions}
                onSelectSession={handleSelectSession}
                onDeleteSession={handleDeleteSession}
              />
            </ScrollArea>
          </SidebarContent>
        </div>
      </Sidebar>
      {children}
    </>
  );
};

// ========================================================================
// The Main Exported Component (ตัวหลักที่ Export ออกไป)
// ========================================================================

export const SessionsSidebar = ({ children }: { children: ReactNode }) => {
  return (
    <SidebarProvider>
      <SidebarLayout>{children}</SidebarLayout>
    </SidebarProvider>
  );
};

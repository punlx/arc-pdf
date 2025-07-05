import { Plus, Ellipsis, Trash, File } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
import { ScrollArea } from '@/components/ui/scroll-area';

import { useSessionActions } from './useSessionActions';

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

const SessionListItem = ({ session }: { session: SessionMeta }) => {
  const { handleSelectSession, handleDeleteSession } = useSessionActions();

  const labelText = session.first_question?.trim();
  const messageCount = session.message_count;

  return (
    <SidebarMenuItem data-testid={`session-item-${session.chat_id}`}>
      <SidebarMenuButton asChild className="flex items-center justify-between">
        <div>
          <div
            className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
            onClick={() => handleSelectSession(session.chat_id)}
          >
            <span className="flex-1 min-w-0 truncate text-[16px]">{labelText}</span>
            <Badge variant="default">{messageCount}</Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                aria-label={`Actions for ${labelText}`}
              >
                <Ellipsis />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-0">
              {/* 🆕 เรียกใช้ handleDeleteSession จาก hook โดยตรง */}
              <DropdownMenuItem
                className="flex justify-between"
                onClick={() => handleDeleteSession(session.chat_id)}
              >
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

const SessionList = ({ sessions }: { sessions: SessionMeta[] }) => {
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
        <SessionListItem key={s.chat_id} session={s} />
      ))}
    </SidebarMenu>
  );
};

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
  const { sessions } = useSessionsStore();
  const resetChat = useChatStore((s) => s.reset);
  const clearFiles = useFilesStore((s) => s.clear);
  const navigate = useNavigate();
  const { isMobile, setOpenMobile } = useSidebar();

  const handleNewChat = () => {
    resetChat();
    clearFiles();
    document.title = 'ArcPDF';
    navigate('/');
    if (isMobile) {
      setOpenMobile(false);
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
              {/* ⬇️ ส่งแค่ข้อมูล sessions ที่จำเป็นลงไป ไม่ต้องส่งฟังก์ชัน */}
              <SessionList sessions={sessions} />
            </ScrollArea>
          </SidebarContent>
        </div>
      </Sidebar>
      {children}
    </>
  );
};

export const SessionsSidebar = ({ children }: { children: ReactNode }) => {
  return (
    <SidebarProvider>
      <SidebarLayout>{children}</SidebarLayout>
    </SidebarProvider>
  );
};

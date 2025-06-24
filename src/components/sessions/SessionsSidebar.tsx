// src\components\sessions\SessionsSidebar.tsx

import { Plus, Ellipsis, Trash, File } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { fullReset } from '@/lib/fullReset';
import { Button } from '@/components/ui/button';
import { useSessionsStore } from '@/stores/sessionsStore';
import { useChatStore } from '@/stores/chatStore';

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
import { useFilesStore } from '@/stores/filesStore';
import { ScrollArea } from '../ui/scroll-area';

/* ---------- Sidebar open trigger (hamburger) ---------- */
const SidebarOpenTrigger = () => {
  const { isMobile, open, openMobile } = useSidebar();

  // ถ้าเป็น mobile ให้ดู openMobile, ถ้า desktop ดู open
  const isClosed = isMobile ? !openMobile : !open;

  return (
    isClosed && (
      <div className="fixed top-2 left-2 z-50">
        <SidebarTrigger className="cursor-pointer" />
      </div>
    )
  );
};

const NewChatButton = () => {
  const resetChat = useChatStore((s) => s.reset);
  const navigate = useNavigate();

  /* ---------- sidebar control ---------- */
  const { isMobile, setOpenMobile } = useSidebar();

  /* ---------- New chat ---------- */
  async function handleNewChat() {
    resetChat(); // รีเซ็ตข้อความ
    useFilesStore.getState().clear(); // ล้างรายชื่อไฟล์
    navigate('/');
    if (isMobile && typeof setOpenMobile === 'function') {
      setOpenMobile(false); // หุบ sidebar เฉพาะ mobile
    }
  }
  return (
    <Button
      onClick={handleNewChat}
      variant="ghost"
      className="w-full border border-white flex gap-1 justify-center items-center rounded-full py-2 cursor-pointer"
      type="button"
    >
      <Plus />
      <span>New Chat</span>
    </Button>
  );
};

/* ---------- Chat session item (ปิด sidebar อัตโนมัติบน mobile) ---------- */
const ChatSessionItem = ({
  session,
  bringToFront,
}: {
  session: any;
  bringToFront: (id: string) => void;
}) => {
  const { isMobile, setOpenMobile } = useSidebar() as any;
  const navigate = useNavigate();

  const handleClick = () => {
    bringToFront(session.chat_id);
    navigate(`/${session.chat_id}`);
    if (isMobile) setOpenMobile(false); // หุบ sidebar เฉพาะ mobile
  };

  const labelText = session.first_question?.trim();
  const messageCount = session.message_count;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 flex-1 min-w-0" onClick={handleClick}>
              <span className="flex-1 min-w-0 truncate">{labelText}</span>
              <Badge variant="default">{messageCount}</Badge>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger>
                <Ellipsis />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-0">
                <DropdownMenuItem
                  className="flex justify-between"
                  onClick={() => {
                    if (window.confirm('ลบแชตนี้ทั้งหมด ?')) {
                      fullReset(session.chat_id);
                    }
                  }}
                >
                  <Trash />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export const SessionsSidebar = ({ children }: { children: ReactNode }) => {
  const sessions = useSessionsStore((s) => s.sessions);
  const bringToFront = useSessionsStore((s) => s.bringToFront);

  return (
    <SidebarProvider>
      <SidebarOpenTrigger />

      <Sidebar collapsible="offcanvas">
        {/* เพิ่ม h-full ให้เต็มความสูง แล้วคง gap-6 เดิม */}
        <div className="flex flex-col gap-6 h-full">
          <SidebarHeader className="items-center justify-between pt-4">
            <img src={LogoImg} width={128} alt="Logo" className="ml-3" />
            <SidebarTrigger className="cursor-pointer" />
          </SidebarHeader>

          {/* ปุ่ม New Chat (คง flex-none) */}
          <SidebarContent className="flex-none px-4">
            <NewChatButton></NewChatButton>
          </SidebarContent>

          {/* โซนรายการแชต สกอลล์ได้ */}
          <SidebarContent className="pl-4">
            <ScrollArea className="h-full w-full pr-4">
              <div className="opacity-60 mb-3">Chats</div>
              <Separator />

              {sessions.length === 0 && (
                <p className="flex items-center gap-3 opacity-60">
                  <File />
                  <span>No sessions yet</span>
                </p>
              )}

              <div className="flex flex-col gap-1 mt-3 pb-4">
                {sessions.map((s) => (
                  <ChatSessionItem key={s.chat_id} session={s} bringToFront={bringToFront} />
                ))}
              </div>
            </ScrollArea>
          </SidebarContent>
        </div>
      </Sidebar>

      {children}
    </SidebarProvider>
  );
};

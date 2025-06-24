// src\components\sessions\SessionsSidebar.tsx

import { Plus, Ellipsis, Forward, Trash, File } from 'lucide-react';
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

const SidebarOpenTrigger = () => {
  const { open } = useSidebar();

  return (
    !open && (
      <div className="fixed top-2 left-2 z-50">
        <SidebarTrigger className="cursor-pointer" />
      </div>
    )
  );
};

/* ---------- helper ---------- */
const formatDate = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('th-TH', { day: 'numeric', month: 'numeric', year: 'numeric' });
};

export const SessionsSidebar = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();

  const sessions = useSessionsStore((s) => s.sessions);

  const bringToFront = useSessionsStore((s) => s.bringToFront);

  const resetChat = useChatStore((s) => s.reset);

  /* ---------- New chat ---------- */
  async function handleNewChat() {
    resetChat(); // รีเซ็ตข้อความ
    useFilesStore.getState().clear(); // ล้างรายชื่อไฟล์
    navigate('/');
  }

  /* ---------- Delete session ---------- */
  async function handleDelete(id: string) {
    if (!window.confirm('ลบแชตนี้ทั้งหมด ?')) return;
    await fullReset(id);
    navigate('/');
  }

  return (
    <>
      <SidebarProvider>
        <SidebarOpenTrigger></SidebarOpenTrigger>
        <Sidebar collapsible="offcanvas">
          <div className="flex flex-col gap-6">
            <SidebarHeader className="items-center justify-between pt-4">
              <img src={LogoImg} width={128} alt="Logo" className="ml-3" />
              <SidebarTrigger className='cursor-pointer' />
            </SidebarHeader>
            <SidebarContent className="flex-none px-4">
              <Button
                onClick={handleNewChat}
                variant="ghost"
                className="w-full border-2 border-white flex gap-1 justify-center items-center rounded-full py-2 cursor-pointer"
                type="button"
              >
                <Plus />
                <span>New Chat</span>
              </Button>
            </SidebarContent>

            <SidebarContent className="px-4">
              <div className="opacity-60">Chats</div>
              <Separator />
              {sessions.length === 0 && (
                <p className="text-muted-foreground flex items-center gap-3">
                  <File />
                  <span>No sessions yet</span>
                </p>
              )}

              {sessions.map((s) => {
                const dateStr = formatDate(s.last_message_time);
                const shortId = `${s.chat_id.slice(0, 7)}…`;
                const labelText = s.first_question?.trim() || `Chat: ${shortId}`;
                const messageCount = s.message_count;

                return (
                  <Link to={`/${s.chat_id}`} onClick={() => bringToFront(s.chat_id)}>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton className="flex items-center justify-between">
                          {/* ---------- label + badge ---------- */}
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {/*  ✅ ตัดคำด้วย … เมื่อยาวเกิน  */}
                            <span className="flex-1 min-w-0 truncate">{labelText}</span>
                            <Badge variant="default">{messageCount}</Badge>
                          </div>

                          {/* ---------- dropdown ---------- */}
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <Ellipsis />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem className="flex justify-evenly">
                                <Forward />
                                <span>Share</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="flex justify-evenly"
                                onClick={() => handleDelete(s.chat_id)}
                              >
                                <Trash />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </Link>
                );
              })}
            </SidebarContent>
          </div>
        </Sidebar>
        {children}
      </SidebarProvider>
    </>
  );
};

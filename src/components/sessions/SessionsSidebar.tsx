import {
  Plus,
  MessageCircle,
  Trash2,
  PanelsLeftBottom,
  Ellipsis,
  Divide,
  Forward,
  Trash,
  MessageCircleX,
  File,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fullReset } from '@/lib/fullReset';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { client } from '@/api/client';
import { useSessionsStore } from '@/stores/sessionsStore';
import { useChatStore } from '@/stores/chatStore';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/tooltip';

// v2
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Separator } from '@/components/ui/separator';
import LogoImg from '@/assets/logo.png';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';

const SidebarOpenTrigger = () => {
  const { open } = useSidebar();

  return (
    !open && (
      <div className="fixed top-2 left-2 z-50">
        <SidebarTrigger />
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
  const { chatId: current } = useParams<{ chatId?: string }>();
  const navigate = useNavigate();

  const sessions = useSessionsStore((s) => s.sessions);

  const bringToFront = useSessionsStore((s) => s.bringToFront);

  const resetChat = useChatStore((s) => s.reset);

  /* ---------- New chat ---------- */
  async function handleNewChat() {
    // const { data } = await client.post('/api/chat/create');
    // resetChat();
    // navigate(`/${data.chat_id}`);
    navigate(`/`);
  }

  /* ---------- Delete session ---------- */
  async function handleDelete(id: string) {
    if (!window.confirm('ลบแชตนี้ทั้งหมด ?')) return;
    await fullReset(id);
    navigate('/');
  }

  // v2
  /* ---------- Render ---------- */

  return (
    <>
      {/* <div className="w-70 border-l h-[calc(100vh-56px)] p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium flex items-center gap-2">
            <MessageCircle className="h-4 w-4" /> Sessions
          </h2>
          <Button size="icon" variant="ghost" onClick={handleNewChat} aria-label="new chat">
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1 pr-2">
          <ul className="space-y-1">
            {sessions.map((s) => {
              const dateStr = formatDate(s.last_message_time);
              const shortId = `${s.chat_id.slice(0, 7)}…`;
              const labelText = s.first_question?.trim() || `Chat: ${shortId}`;

              return (
                <li key={s.chat_id} className="group flex items-center justify-between">
                  <Tooltip label={s.first_question || 'No message yet'} side="right">
                    <Link
                      to={`/${s.chat_id}`}
                      onClick={() => bringToFront(s.chat_id)}
                      className={cn(
                        'block flex-1 truncate px-3 py-2 rounded-md text-sm hover:bg-muted transition',
                        current === s.chat_id && 'bg-muted font-semibold'
                      )}
                    >
                      {labelText} {dateStr && `(${dateStr})`} ({s.message_count})
                    </Link>
                  </Tooltip>

                  <button
                    onClick={() => handleDelete(s.chat_id)}
                    aria-label="delete session"
                    className="opacity-50 group-hover:opacity-100 transition mr-1 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}

            {sessions.length === 0 && (
              <p className="text-muted-foreground text-sm mt-2">No sessions yet</p>
            )}
          </ul>
        </ScrollArea>
      </div> */}

      <SidebarProvider>
        <SidebarOpenTrigger></SidebarOpenTrigger>
        <Sidebar collapsible="offcanvas">
          <div className="flex flex-col gap-6">
            <SidebarHeader className="items-center justify-between pt-4">
              <img src={LogoImg} width={128} alt="Logo" className="ml-3" />
              <SidebarTrigger />
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

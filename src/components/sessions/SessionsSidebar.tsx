import { Plus, MessageCircle, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fullReset } from '@/lib/fullReset';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { client } from '@/api/client';
import { useSessionsStore } from '@/stores/sessionsStore';
import { useChatStore } from '@/stores/chatStore';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/tooltip';

/* ---------- helper ---------- */
const formatDate = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('th-TH', { day: 'numeric', month: 'numeric', year: 'numeric' });
};

export const SessionsSidebar = () => {
  const { chatId: current } = useParams<{ chatId?: string }>();
  const navigate = useNavigate();

  const sessions = useSessionsStore((s) => s.sessions);

  const bringToFront = useSessionsStore((s) => s.bringToFront);

  const resetChat = useChatStore((s) => s.reset);

  /* ---------- New chat ---------- */
  async function handleNewChat() {
    const { data } = await client.post('/api/chat/create');
    resetChat();
    navigate(`/${data.chat_id}`);
  }

  /* ---------- Delete session ---------- */
  async function handleDelete(id: string) {
    if (!window.confirm('ลบแชตนี้ทั้งหมด ?')) return;
    await fullReset(id);
    navigate('/');
  }

  /* ---------- Render ---------- */
  return (
    <div className="w-70 border-l h-[calc(100vh-56px)] p-4 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-medium flex items-center gap-2">
          <MessageCircle className="h-4 w-4" /> Sessions
        </h2>
        <Button size="icon" variant="ghost" onClick={handleNewChat} aria-label="new chat">
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {/* List */}
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

                {/* Trash button – show on hover */}
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
    </div>
  );
};

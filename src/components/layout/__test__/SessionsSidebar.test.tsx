// src/components/layout/__test__/SessionsSidebar.test.tsx

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SessionsSidebar } from '../SessionsSidebar';
import { MemoryRouter } from 'react-router-dom';
import type { UserEvent } from '@testing-library/user-event'; // 🆕

// --- 1. Mock Dependencies ---
import { useSessionsStore, type SessionMeta, type SessionsState } from '@/stores/sessionsStore'; // 🆕
import { useChatStore, type ChatState } from '@/stores/chatStore'; // 🆕
import { useFilesStore, type FilesState } from '@/stores/filesStore'; // 🆕
import { fullReset } from '@/lib/fullReset';
import * as SidebarHooks from '@/components/ui/sidebar';

vi.mock('@/stores/sessionsStore');
vi.mock('@/stores/chatStore');
vi.mock('@/stores/filesStore');
vi.mock('@/lib/fullReset');

// --- 2. สร้าง Mock Functions และ Data ---
const mockBringToFront = vi.fn();
const mockResetChat = vi.fn();
const mockClearFiles = vi.fn();
const mockFullReset = vi.fn();
const mockNavigate = vi.fn();

// 🆕 แก้ไข Type ของ importOriginal
vi.mock(
  'react-router-dom',
  async (importOriginal: () => Promise<typeof import('react-router-dom')>) => {
    const actual = await importOriginal();
    return { ...actual, useNavigate: () => mockNavigate };
  }
);

const mockSessions: SessionMeta[] = [
  { chat_id: 'chat-1', first_question: 'What is React?', message_count: 5 },
  { chat_id: 'chat-2', first_question: 'How does Vitest work?', message_count: 10 },
];

// 🆕 สร้าง state จำลองพร้อม Type ที่ชัดเจน
const mockSessionStoreState: Partial<SessionsState> = {
  sessions: mockSessions,
  bringToFront: mockBringToFront,
};
const mockChatStoreState: Partial<ChatState> = { reset: mockResetChat };
const mockFileStoreState: Partial<FilesState> = { clear: mockClearFiles };

describe('<SessionsSidebar />', () => {
  let user: UserEvent; // 🆕
  let confirmSpy: ReturnType<typeof vi.spyOn>; // 🆕

  beforeEach(() => {
    user = userEvent.setup();
    document.title = 'ArcPDF';
    confirmSpy = vi.spyOn(window, 'confirm');

    // 🆕 เพิ่ม Type ให้ selector และ cast state ให้ถูกต้อง
    vi.mocked(useSessionsStore).mockImplementation((selector?: (state: SessionsState) => any) =>
      selector
        ? selector(mockSessionStoreState as SessionsState)
        : (mockSessionStoreState as SessionsState)
    );
    vi.mocked(useChatStore).mockImplementation((selector?: (state: ChatState) => any) =>
      selector ? selector(mockChatStoreState as ChatState) : (mockChatStoreState as ChatState)
    );
    vi.mocked(useFilesStore).mockImplementation((selector?: (state: FilesState) => any) =>
      selector ? selector(mockFileStoreState as FilesState) : (mockFileStoreState as FilesState)
    );

    vi.spyOn(SidebarHooks, 'useSidebar').mockReturnValue({
      isMobile: false,
      open: true,
      openMobile: false,
      setOpen: vi.fn(),
      setOpenMobile: vi.fn(),
    });

    vi.mocked(fullReset).mockImplementation(mockFullReset);
  });

  afterEach(() => {
    vi.clearAllMocks();
    confirmSpy.mockRestore();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <SessionsSidebar>
          <div>Test Children</div>
        </SessionsSidebar>
      </MemoryRouter>
    );
  };

  it('should render a list of sessions correctly', () => {
    renderComponent();
    expect(screen.getByText('What is React?')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should call relevant actions when "New Chat" is clicked', async () => {
    renderComponent();
    const newChatButton = screen.getByRole('button', { name: /new chat/i });
    await user.click(newChatButton);
    expect(mockResetChat).toHaveBeenCalledTimes(1);
    expect(mockClearFiles).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should navigate and update title when a session is clicked', async () => {
    renderComponent();
    const firstSession = screen.getByText('What is React?');
    await user.click(firstSession);
    expect(mockBringToFront).toHaveBeenCalledWith('chat-1');
    expect(mockNavigate).toHaveBeenCalledWith('/chat-1');
  });

  it('should call fullReset when delete is confirmed', async () => {
    confirmSpy.mockReturnValue(true);
    renderComponent();
    const firstSessionItem = screen.getByTestId('session-item-chat-1');
    const ellipsisButton = within(firstSessionItem).getByRole('button', { name: /Actions for/i });
    await user.click(ellipsisButton);
    const deleteButton = await screen.findByRole('menuitem', { name: /delete/i });
    await user.click(deleteButton);
    expect(confirmSpy).toHaveBeenCalledTimes(1);
    expect(mockFullReset).toHaveBeenCalledTimes(1);
    expect(mockFullReset).toHaveBeenCalledWith('chat-1', mockNavigate);
  });

  it('should NOT call fullReset when delete is cancelled', async () => {
    confirmSpy.mockReturnValue(false);
    renderComponent();
    const firstSessionItem = screen.getByTestId('session-item-chat-1');
    const ellipsisButton = within(firstSessionItem).getByRole('button', { name: /Actions for/i });
    await user.click(ellipsisButton);
    const deleteButton = await screen.findByRole('menuitem', { name: /delete/i });
    await user.click(deleteButton);
    expect(confirmSpy).toHaveBeenCalledTimes(1);
    expect(mockFullReset).not.toHaveBeenCalled();
  });
});

// src/components/layout/__test__/SessionsSidebar.test.tsx
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SessionsSidebar } from '../SessionsSidebar';
import { MemoryRouter } from 'react-router-dom';

// --- 1. Mock Dependencies ---
import { useSessionsStore, type SessionMeta } from '@/stores/sessionsStore';
import { useChatStore } from '@/stores/chatStore';
import { useFilesStore } from '@/stores/filesStore';
import { fullReset } from '@/lib/fullReset';
// 🔄 1. Import module ของ sidebar เข้ามาตรงๆ เพื่อใช้ spyOn
import * as SidebarHooks from '@/components/ui/sidebar';

vi.mock('@/stores/sessionsStore');
vi.mock('@/stores/chatStore');
vi.mock('@/stores/filesStore');
vi.mock('@/lib/fullReset');
// 🗑️ 2. ลบ vi.mock ของ sidebar ทั้งโมดูลออกไป
// vi.mock('@/components/ui/sidebar');

// --- 2. สร้าง Mock Functions และ Data ---
const mockBringToFront = vi.fn();
const mockResetChat = vi.fn();
const mockClearFiles = vi.fn();
const mockFullReset = vi.fn();
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockSessions: SessionMeta[] = [
  { chat_id: 'chat-1', first_question: 'What is React?', message_count: 5 },
  { chat_id: 'chat-2', first_question: 'How does Vitest work?', message_count: 10 },
];

const mockSessionStoreState = { sessions: mockSessions, bringToFront: mockBringToFront };
const mockChatStoreState = { reset: mockResetChat };
const mockFileStoreState = { clear: mockClearFiles };

describe('<SessionsSidebar />', () => {
  let user;
  let confirmSpy;

  // --- 3. ตั้งค่า Mock เริ่มต้น ---
  beforeEach(() => {
    user = userEvent.setup();
    document.title = 'ArcPDF';
    confirmSpy = vi.spyOn(window, 'confirm');

    // Mock Zustand Stores
    vi.mocked(useSessionsStore).mockImplementation((selector) =>
      selector ? selector(mockSessionStoreState) : mockSessionStoreState
    );
    vi.mocked(useChatStore).mockImplementation((selector) =>
      selector ? selector(mockChatStoreState) : mockChatStoreState
    );
    vi.mocked(useFilesStore).mockImplementation((selector) =>
      selector ? selector(mockFileStoreState) : mockFileStoreState
    );

    // 🔄 3. ใช้ spyOn เพื่อ mock เฉพาะ useSidebar hook
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

  // --- 4. Test Cases (โค้ดเหมือนเดิม) ---

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

    // 🔄 1. หา session item ที่ต้องการจะลบโดยใช้ data-testid
    const firstSessionItem = screen.getByTestId('session-item-chat-1');

    // 🔄 2. ค้นหาปุ่ม Actions ที่อยู่ "ข้างใน" session item นั้นเท่านั้น
    const ellipsisButton = within(firstSessionItem).getByRole('button', { name: /Actions for/i });
    await user.click(ellipsisButton);

    const deleteButton = await screen.findByRole('menuitem', { name: /delete/i });
    await user.click(deleteButton);

    expect(confirmSpy).toHaveBeenCalledTimes(1);
    expect(mockFullReset).toHaveBeenCalledTimes(1);
    // Assertion นี้จะผ่านแล้ว เพราะเราคลิกปุ่มของ chat-1 จริงๆ
    expect(mockFullReset).toHaveBeenCalledWith('chat-1', mockNavigate);
  });

  it('should NOT call fullReset when delete is cancelled', async () => {
    confirmSpy.mockReturnValue(false);
    renderComponent();

    // 🔄 ใช้วิธีเลือกที่แข็งแรงเหมือนกัน
    const firstSessionItem = screen.getByTestId('session-item-chat-1');
    const ellipsisButton = within(firstSessionItem).getByRole('button', { name: /Actions for/i });
    await user.click(ellipsisButton);

    const deleteButton = await screen.findByRole('menuitem', { name: /delete/i });
    await user.click(deleteButton);

    expect(confirmSpy).toHaveBeenCalledTimes(1);
    expect(mockFullReset).not.toHaveBeenCalled();
  });
});

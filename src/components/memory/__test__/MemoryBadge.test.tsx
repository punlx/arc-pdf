// src/components/memory/__test__/MemoryBadge.test.tsx

import { render, screen } from '@testing-library/react';
import { MemoryBadge } from '../MemoryBadge';

import { useChatStore, type ChatState } from '@/stores/chatStore';
import { useSessionsStore, type SessionsState } from '@/stores/sessionsStore';

vi.mock('@/stores/chatStore');
vi.mock('@/stores/sessionsStore');

const mockChatId = 'test-chat-id';

describe('<MemoryBadge />', () => {
  beforeEach(() => {
    // 👇 [FIX] เพิ่ม Type (state: ChatState) => any ให้กับ selector
    vi.mocked(useChatStore).mockImplementation((selector: (state: ChatState) => any) => {
      const state: Partial<ChatState> = { chatId: mockChatId };
      return selector(state as ChatState);
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should display the "Memory" badge when hasMemory is true', () => {
    // Arrange
    // 👇 [FIX] เพิ่ม Type (state: SessionsState) => any ให้กับ selector
    vi.mocked(useSessionsStore).mockImplementation((selector: (state: SessionsState) => any) => {
      const state: Partial<SessionsState> = {
        sessions: [{ chat_id: mockChatId, has_memory: true } as any],
      };
      return selector(state as SessionsState);
    });

    // Act
    render(<MemoryBadge />);

    // Assert
    const memoryBadge = screen.getByText(/Memory/i);
    expect(memoryBadge).toBeInTheDocument();
    expect(memoryBadge.parentElement).toHaveClass('bg-green-600');
    expect(screen.queryByText('No Memory')).not.toBeInTheDocument();
  });

  it('should display the "No Memory" badge when hasMemory is false', () => {
    // Arrange
    // 👇 [FIX] เพิ่ม Type (state: SessionsState) => any ให้กับ selector
    vi.mocked(useSessionsStore).mockImplementation((selector: (state: SessionsState) => any) => {
      const state: Partial<SessionsState> = {
        sessions: [{ chat_id: mockChatId, has_memory: false } as any],
      };
      return selector(state as SessionsState);
    });

    // Act
    render(<MemoryBadge />);

    // Assert
    const noMemoryBadge = screen.getByText('No Memory');
    expect(noMemoryBadge).toBeInTheDocument();
    expect(noMemoryBadge).toHaveClass('border');
    expect(screen.queryByText(/^Memory$/)).not.toBeInTheDocument();
  });
});

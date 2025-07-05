// src/components/layout/Header/__test__/ChatPageHeaderActions.test.tsx

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatPageHeaderActions } from '../Header/ChatPageHeaderActions';
import { MemoryRouter } from 'react-router-dom';
import type { UserEvent } from '@testing-library/user-event';

// --- 1. Mock Dependencies ---
import { useIsMobile } from '@/hooks/useMobile';
import { useChatStore, type ChatState } from '@/stores/chatStore';
import { useSessionsStore, type SessionsState } from '@/stores/sessionsStore';
import { fullReset } from '@/lib/fullReset';

// Mock Hooks and Libraries
vi.mock('@/hooks/useMobile');
vi.mock('@/stores/chatStore');
vi.mock('@/stores/sessionsStore');
vi.mock('@/lib/fullReset');

// Mock Child Components
vi.mock('@/components/memory/MemoryBadge', () => ({
  MemoryBadge: () => <div data-testid="memory-badge" />,
}));

vi.mock('@/components/layout/Header/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

vi.mock('@/components/layout/Header/ChatPageHeaderActions/StreamModeToggle', () => ({
  StreamModeToggle: () => <div data-testid="stream-mode-toggle" />,
}));

vi.mock('@/components/layout/Header/ChatPageHeaderActions/MobileSettingsSheet', () => ({
  MobileSettingsSheet: () => <div data-testid="mobile-settings-sheet" />,
}));

const mockFullReset = vi.fn();
const mockNavigate = vi.fn();

// Mock useNavigate from react-router-dom
vi.mock(
  'react-router-dom',
  async (importOriginal: () => Promise<typeof import('react-router-dom')>) => {
    const actual = await importOriginal();
    return {
      ...actual,
      useNavigate: () => mockNavigate,
    };
  }
);

describe('<ChatPageHeaderActions />', () => {
  let user: UserEvent;
  let confirmSpy: ReturnType<typeof vi.spyOn>;
  const mockChatId = 'test-chat-id';

  beforeEach(() => {
    user = userEvent.setup();
    confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    // Mock useChatStore with correct selector typing
    vi.mocked(useChatStore).mockImplementation((selector: (state: ChatState) => any) => {
      const state: Partial<ChatState> = { chatId: mockChatId };
      return selector(state as ChatState);
    });

    // Mock useSessionsStore with correct selector typing
    vi.mocked(useSessionsStore).mockImplementation((selector: (state: SessionsState) => any) => {
      const state: Partial<SessionsState> = {
        sessions: [{ chat_id: mockChatId, has_memory: true } as any],
      };
      return selector(state as SessionsState);
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
        <ChatPageHeaderActions />
      </MemoryRouter>
    );
  };

  describe('Rendering based on screen size', () => {
    it('should render desktop-specific components when on a larger screen', () => {
      vi.mocked(useIsMobile).mockReturnValue(false);
      renderComponent();
      expect(screen.getByTestId('memory-badge')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
      expect(screen.getByTestId('stream-mode-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
      expect(screen.queryByTestId('mobile-settings-sheet')).not.toBeInTheDocument();
    });

    it('should render mobile-specific component when on a mobile screen', () => {
      vi.mocked(useIsMobile).mockReturnValue(true);
      renderComponent();
      expect(screen.getByTestId('memory-badge')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
      expect(screen.getByTestId('mobile-settings-sheet')).toBeInTheDocument();
      expect(screen.queryByTestId('stream-mode-toggle')).not.toBeInTheDocument();
      expect(screen.queryByTestId('theme-toggle')).not.toBeInTheDocument();
    });
  });

  describe('Reset Button functionality', () => {
    it('should call fullReset with correct arguments when user confirms', async () => {
      confirmSpy.mockReturnValue(true);

      renderComponent();
      const resetButton = screen.getByRole('button', { name: 'Reset' });
      expect(resetButton).not.toBeDisabled();
      await user.click(resetButton);

      expect(confirmSpy).toHaveBeenCalledTimes(1);
      expect(mockFullReset).toHaveBeenCalledTimes(1);
      expect(mockFullReset).toHaveBeenCalledWith(mockChatId, mockNavigate);
    });

    it('should NOT call fullReset when user cancels', async () => {
      confirmSpy.mockReturnValue(false);

      renderComponent();
      const resetButton = screen.getByRole('button', { name: 'Reset' });
      expect(resetButton).not.toBeDisabled();
      await user.click(resetButton);

      expect(confirmSpy).toHaveBeenCalledTimes(1);
      expect(mockFullReset).not.toHaveBeenCalled();
    });
  });
});

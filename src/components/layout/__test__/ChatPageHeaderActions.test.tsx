// src/components/layout/Header/__test__/ChatPageHeaderActions.test.tsx

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatPageHeaderActions } from '../Header/ChatPageHeaderActions';
import { MemoryRouter } from 'react-router-dom';
import type { UserEvent } from '@testing-library/user-event';

// --- 1. Mock Dependencies ---
import { useIsMobile } from '@/hooks/useMobile';
import { useChatStore, type ChatState } from '@/stores/chatStore';
import { fullReset } from '@/lib/fullReset';

// Mock Hooks
vi.mock('@/hooks/useMobile');
vi.mock('@/stores/chatStore');
vi.mock('@/lib/fullReset');

// Mock Child Components
vi.mock('@/components/memory/MemoryBadge', () => ({
  MemoryBadge: () => <div data-testid="memory-badge" />,
}));
vi.mock('@/components/theme/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));
vi.mock('../Header/StreamModeToggle', () => ({
  StreamModeToggle: () => <div data-testid="stream-mode-toggle" />,
}));
vi.mock('../Header/MobileSettingsSheet', () => ({
  MobileSettingsSheet: () => <div data-testid="mobile-settings-sheet" />,
}));

const mockFullReset = vi.fn();
const mockNavigate = vi.fn();

// Mock useNavigate hook
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
  let confirmSpy: ReturnType<typeof vi.spyOn>; // 🔄 แก้ไข Type ให้เป็น vi.Spy

  beforeEach(() => {
    user = userEvent.setup();
    confirmSpy = vi.spyOn(window, 'confirm');

    vi.mocked(useChatStore).mockImplementation((selector: (state: ChatState) => any) =>
      selector({ chatId: 'test-chat-id' } as ChatState)
    );
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
    });

    it('should render mobile-specific component when on a mobile screen', () => {
      vi.mocked(useIsMobile).mockReturnValue(true);
      renderComponent();
      expect(screen.getByTestId('memory-badge')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
      expect(screen.getByTestId('mobile-settings-sheet')).toBeInTheDocument();
    });
  });

  describe('Reset Button functionality', () => {
    it('should call fullReset with correct arguments when user confirms', async () => {
      confirmSpy.mockReturnValue(true);
      renderComponent();
      const resetButton = screen.getByRole('button', { name: 'Reset' });
      await user.click(resetButton);
      expect(confirmSpy).toHaveBeenCalledTimes(1);
      expect(mockFullReset).toHaveBeenCalledTimes(1);
      expect(mockFullReset).toHaveBeenCalledWith('test-chat-id', mockNavigate);
    });

    it('should NOT call fullReset when user cancels', async () => {
      confirmSpy.mockReturnValue(false);
      renderComponent();
      const resetButton = screen.getByRole('button', { name: 'Reset' });
      await user.click(resetButton);
      expect(confirmSpy).toHaveBeenCalledTimes(1);
      expect(mockFullReset).not.toHaveBeenCalled();
    });
  });
});

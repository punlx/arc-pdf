// src/components/layout/Header/__test__/ChatPageHeaderActions.test.tsx

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatPageHeaderActions } from '../Header/ChatPageHeaderActions';
import { MemoryRouter } from 'react-router-dom';

// --- 1. Mock Dependencies ---
import { useIsMobile } from '@/hooks/useMobile';
import { useChatStore } from '@/stores/chatStore';
import { fullReset } from '@/lib/fullReset';

// Mock Hooksa
vi.mock('@/hooks/useMobile');
vi.mock('@/stores/chatStore');
vi.mock('@/lib/fullReset');

// Mock Child Components to isolate the test
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
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('<ChatPageHeaderActions />', () => {
  let user;
  let confirmSpy;

  beforeEach(() => {
    user = userEvent.setup();
    confirmSpy = vi.spyOn(window, 'confirm');

    // Default mock setup
    vi.mocked(useChatStore).mockImplementation((selector) => selector({ chatId: 'test-chat-id' }));
    vi.mocked(fullReset).mockImplementation(mockFullReset);
  });

  afterEach(() => {
    vi.clearAllMocks();
    confirmSpy.mockRestore();
  });

  // Helper for rendering with Router context
  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <ChatPageHeaderActions />
      </MemoryRouter>
    );
  };

  describe('Rendering based on screen size', () => {
    it('should render desktop-specific components when on a larger screen', () => {
      // Arrange: จำลองว่าเป็นหน้าจอ Desktop
      vi.mocked(useIsMobile).mockReturnValue(false);

      // Act
      renderComponent();

      // Assert
      expect(screen.getByTestId('memory-badge')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
      expect(screen.getByTestId('stream-mode-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
      expect(screen.queryByTestId('mobile-settings-sheet')).not.toBeInTheDocument();
    });

    it('should render mobile-specific component when on a mobile screen', () => {
      // Arrange: จำลองว่าเป็นหน้าจอ Mobile
      vi.mocked(useIsMobile).mockReturnValue(true);

      // Act
      renderComponent();

      // Assert
      expect(screen.getByTestId('memory-badge')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
      expect(screen.getByTestId('mobile-settings-sheet')).toBeInTheDocument();
      expect(screen.queryByTestId('stream-mode-toggle')).not.toBeInTheDocument();
      expect(screen.queryByTestId('theme-toggle')).not.toBeInTheDocument();
    });
  });

  describe('Reset Button functionality', () => {
    it('should call fullReset with correct arguments when user confirms', async () => {
      // Arrange
      confirmSpy.mockReturnValue(true); // จำลองว่าผู้ใช้กด "OK"
      renderComponent();
      const resetButton = screen.getByRole('button', { name: 'Reset' });

      // Act
      await user.click(resetButton);

      // Assert
      expect(confirmSpy).toHaveBeenCalledTimes(1);
      expect(mockFullReset).toHaveBeenCalledTimes(1);
      expect(mockFullReset).toHaveBeenCalledWith('test-chat-id', mockNavigate);
    });

    it('should NOT call fullReset when user cancels', async () => {
      // Arrange
      confirmSpy.mockReturnValue(false); // จำลองว่าผู้ใช้กด "Cancel"
      renderComponent();
      const resetButton = screen.getByRole('button', { name: 'Reset' });

      // Act
      await user.click(resetButton);

      // Assert
      expect(confirmSpy).toHaveBeenCalledTimes(1);
      expect(mockFullReset).not.toHaveBeenCalled();
    });
  });
});
